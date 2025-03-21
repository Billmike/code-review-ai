import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import Python from 'tree-sitter-python';
import TypeScript from 'tree-sitter-typescript';

// Analysis request interface
interface AnalysisRequest {
  installationId: number;
  owner: string;
  repo: string;
  prNumber: number;
  headSha: string;
  baseSha: string;
  reviewStyle: 'standard' | 'strict' | 'collaborative';
}

// Analysis result interface
interface AnalysisResult {
  commentCount: number;
  issues: Array<{
    path: string;
    line: number;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
}

type Language = 'javascript' | 'python' | 'typescript' | 'text';

// GitHub client cache to avoid creating new clients for every request
const githubClientCache = new Map<number, Octokit>();

class CodeAnalyzer {
  private openai: OpenAI;
  private anthropic: Anthropic;
  
  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Initialize Anthropic client
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  // Get GitHub client for installation
  private async getGithubClient(installationId: number): Promise<Octokit> {
    // Check cache first
    if (githubClientCache.has(installationId)) {
      return githubClientCache.get(installationId)!;
    }
    
    // Create new client
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        installationId: installationId.toString(),
      },
    });
    
    // Cache client
    githubClientCache.set(installationId, octokit);
    
    return octokit;
  }
  
  // Fetch PR details and changed files
  private async fetchPullRequestDetails(
    octokit: Octokit,
    owner: string,
    repo: string,
    prNumber: number
  ) {
    // Get PR details
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });
    
    // Get list of changed files
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });
    
    return { pullRequest, files };
  }
  
  // Fetch file content
  private async fetchFileContent(
    octokit: Octokit,
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<string> {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });
      
      // Handle different response types
      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      logger.error(`Error fetching file content for ${path}:`, error);
      return '';
    }
  }
  
  // Determine file language and appropriate parser
  private getLanguageAndParser(filename: string): { language: Language; } {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
        return { language: 'javascript' };
      case 'py':
        return { language: 'python' };
      case 'ts':
      case 'tsx':
        return { language: 'typescript' };
      default:
        return { language: 'text' };
    }
  }
  
  // Parse code into AST for deeper analysis
  private parseCode(code: string, language: Language): any {
    const parser = new Parser();
    
    try {
     if (language === 'javascript') {
        parser.setLanguage(JavaScript as any)
     } else if (language === 'python') {
      parser.setLanguage(Python as any)
     } else if (language === 'typescript') {
      parser.setLanguage(TypeScript as any)
     }
      
      // Parse code
      const tree = parser.parse(code);
      return tree;
    } catch (error) {
      logger.error(`Error parsing ${language} code:`, error);
      return null;
    }
  }
  
  // Generate AI review for a specific file
  private async generateAIReview(
    fileContent: string,
    filePath: string,
    language: string,
    reviewStyle: 'standard' | 'strict' | 'collaborative'
  ): Promise<Array<{ line: number; message: string; severity: 'info' | 'warning' | 'error' }>> {
    try {
      // Choose AI engine based on file size
      const useAnthropicForLargeFiles = fileContent.length > 10000;
      
      // Create prompt based on review style
      const reviewStylePrompts = {
        standard: "Provide a balanced code review focusing on bugs, performance issues, and style improvements. Be direct but constructive.",
        strict: "Provide a thorough code review focusing on correctness, security, edge cases, and maintainability. Be comprehensive and highlight all potential issues.",
        collaborative: "Provide a supportive code review focusing on suggestions rather than criticisms. Highlight good patterns along with possible improvements."
      };
      
      const prompt = `
You are an expert code reviewer analyzing a ${language} file. 
${reviewStylePrompts[reviewStyle]}

Analyze the following code and provide specific, actionable feedback.
For each issue:
1. Identify the line number
2. Describe the issue concisely
3. Explain why it's a problem
4. Suggest a specific improvement
5. Rate severity as: "info" (style/suggestion), "warning" (potential issue), or "error" (definite bug or serious concern)

Only focus on real, specific issues. Prioritize:
- Logic errors and bugs
- Performance problems
- Security vulnerabilities
- Maintainability concerns
- Code organization and clarity

File path: ${filePath}

\`\`\`${language}
${fileContent}
\`\`\`

Return your review as a JSON array of issues in the following format:
[
  {
    "line": <line_number>,
    "message": "<clear explanation with suggestion>",
    "severity": "<info|warning|error>"
  },
  ...
]
`;

      let reviewText = '';
      
      // Use appropriate AI model based on file size
      if (useAnthropicForLargeFiles) {
        // const response = await this.anthropic.messages.create({
        //   model: 'claude-3-opus-20240229',
        //   max_tokens: 4000,
        //   system: "You are an expert code reviewer who provides specific, actionable feedback. You respond with valid JSON only.",
        //   messages: [
        //     { role: 'user', content: prompt }
        //   ],
        // });
        // reviewText = response.content[0].text;
      } else {
        await this.openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: "You are an expert code reviewer who provides specific, actionable feedback. You respond with valid JSON only." },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        });
        reviewText = 'We get here';
      }
      
      // Extract JSON from response
      const jsonMatch = reviewText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        logger.warn(`AI response did not contain valid JSON: ${reviewText.substring(0, 100)}...`);
        return [];
      }
      
      // Parse review
      const review = JSON.parse(jsonMatch[0]);
      return review;
    } catch (error) {
      logger.error(`Error generating AI review for ${filePath}:`, error);
      return [];
    }
  }
  
  // Post comments to GitHub PR
  private async postCommentsToGitHub(
    octokit: Octokit,
    owner: string,
    repo: string,
    prNumber: number,
    issues: Array<{
      path: string;
      line: number;
      message: string;
      severity: 'info' | 'warning' | 'error';
    }>
  ): Promise<number> {
    let commentCount = 0;
    
    // Group comments by file
    const commentsByFile = issues.reduce((acc, issue) => {
      if (!acc[issue.path]) {
        acc[issue.path] = [];
      }
      acc[issue.path]?.push(issue);
      return acc;
    }, {} as Record<string, typeof issues>);
    
    // Post comments for each file
    for (const [path, fileIssues] of Object.entries(commentsByFile)) {
      try {
        // Sort issues by line number
        fileIssues.sort((a, b) => a.line - b.line);
        
        // Create review comments
        const comments = fileIssues.map(issue => ({
          path,
          line: issue.line,
          body: `**${issue.severity.toUpperCase()}**: ${issue.message}`,
        }));
        
        // Submit review
        await octokit.rest.pulls.createReview({
          owner,
          repo,
          pull_number: prNumber,
          event: 'COMMENT',
          comments,
        });
        
        commentCount += comments.length;
      } catch (error) {
        logger.error(`Error posting comments for ${path}:`, error);
      }
    }
    
    return commentCount;
  }
  
  // Main analysis function
  public async analyzePullRequest(request: AnalysisRequest): Promise<AnalysisResult> {
    const { installationId, owner, repo, prNumber, headSha, reviewStyle } = request;
    logger.info(`Starting analysis of PR #${prNumber} with ${reviewStyle} style`);
    
    // Get GitHub client
    const octokit = await this.getGithubClient(installationId);
    
    // Fetch PR details and files
    const { pullRequest, files } = await this.fetchPullRequestDetails(octokit, owner, repo, prNumber);
    
    const allIssues: Array<{
      path: string;
      line: number;
      message: string;
      severity: 'info' | 'warning' | 'error';
    }> = [];
    
    // Process each changed file
    for (const file of files) {
      // Skip deleted files and non-code files
      if (file.status === 'removed' || file.changes <= 0) {
        continue;
      }
      
      // Skip large binary files and images
      const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.exe'];
      if (binaryExtensions.some(ext => file.filename.toLowerCase().endsWith(ext))) {
        continue;
      }
      
      // Get file content
      const fileContent = await this.fetchFileContent(octokit, owner, repo, file.filename, headSha);
      if (!fileContent) continue;
      
      // Determine language and parser
      const { language } = this.getLanguageAndParser(file.filename);
      
      // Skip unsupported languages
      if (language === 'text') {
        continue;
      }
      
      // Parse code for static analysis
      const ast = this.parseCode(fileContent, language);
      
      // Generate AI review
      const fileIssues = await this.generateAIReview(fileContent, file.filename, language, reviewStyle);
      
      // Add file path to issues
      const issuesWithPath = fileIssues.map(issue => ({
        ...issue,
        path: file.filename,
      }));
      
      allIssues.push(...issuesWithPath);
    }
    
    // Post comments to GitHub
    const commentCount = await this.postCommentsToGitHub(octokit, owner, repo, prNumber, allIssues);
    
    // Add summary comment
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `## CodeReviewAI Summary
      
I've reviewed this PR using the **${reviewStyle}** review style and found:
- **${allIssues.filter(i => i.severity === 'error').length}** potential errors
- **${allIssues.filter(i => i.severity === 'warning').length}** warnings
- **${allIssues.filter(i => i.severity === 'info').length}** suggestions

${allIssues.length > 0 ? 'Please check my comments for details.' : 'Everything looks good! No issues found.'}

*This review was generated automatically by CodeReviewAI*`,
    });
    
    logger.info(`Completed analysis of PR #${prNumber} with ${commentCount} comments`);
    
    return {
      commentCount: commentCount + 1, // +1 for summary comment
      issues: allIssues,
    };
  }
}

export const codeAnalyzer = new CodeAnalyzer();