import Bull from 'bull';
import { logger } from '../../utils/logger';
import { codeAnalyzer } from '../ai/codeAnalyzer';
import { PullRequest } from '../../models/pullRequest';

// Define queue job interface
interface AnalysisJob {
  prId: number;
  repositoryId: number;
  installationId: number;
  owner: string;
  repo: string;
  prNumber: number;
  headSha: string;
  baseSha: string;
}

// Create Bull queue
const analysisQueue = new Bull<AnalysisJob>('pr-analysis', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Add job to queue
export const addToAnalysisQueue = async (job: AnalysisJob): Promise<void> => {
  await analysisQueue.add(job);
  logger.info(`Added PR #${job.prNumber} (${job.owner}/${job.repo}) to analysis queue`);
};

// Process jobs
analysisQueue.process(async (job) => {
  const { prId, repositoryId, installationId, owner, repo, prNumber, headSha, baseSha } = job.data;
  logger.info(`Starting analysis of PR #${prNumber} (${owner}/${repo})`);

  try {
    // Update PR status to analyzing
    const pullRequest = await PullRequest.findByPk(prId);
    if (!pullRequest) {
      throw new Error(`Pull request with ID ${prId} not found`);
    }

    await pullRequest.update({
      status: 'analyzing',
      reviewStartedAt: new Date(),
    });

    // Analyze code
    const result = await codeAnalyzer.analyzePullRequest({
      installationId,
      owner,
      repo,
      prNumber,
      headSha,
      baseSha,
      reviewStyle: pullRequest.reviewStyle || 'standard',
    });

    // Update PR status to completed
    await pullRequest.update({
      status: 'completed',
      reviewCompletedAt: new Date(),
      commentCount: result.commentCount,
    });

    logger.info(`Completed analysis of PR #${prNumber} (${owner}/${repo}) with ${result.commentCount} comments`);
    return result;
  } catch (error) {
    logger.error(`Error analyzing PR #${prNumber} (${owner}/${repo}):`, error);

    // Update PR status to failed
    const pullRequest = await PullRequest.findByPk(prId);
    if (pullRequest) {
      await pullRequest.update({
        status: 'failed',
      });
    }

    throw error;
  }
});

// Handle queue events
analysisQueue.on('error', (error) => {
  logger.error('Analysis queue error:', error);
});

analysisQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed:`, error);
});