import { Request, Response } from 'express';
import crypto from 'crypto';
import { addToAnalysisQueue } from '../queue/analysisQueue';
import { Repository } from '../../models/repository';
import { PullRequest } from '../../models/pullRequest';
import { Octokit } from 'octokit';
import { logger } from '../../utils/logger';

// Verify webhook signature
const verifySignature = (req: Request): boolean => {
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) {
    return false;
  }

  const payload = JSON.stringify(req.body);
  const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
  const hmac = crypto.createHmac('sha256', secret);
  const computedSignature = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
};

// Handle pull request event
export const handlePullRequestEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verify webhook signature
    if (!verifySignature(req)) {
      logger.warn('Invalid webhook signature');
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }

    const event = req.headers['x-github-event'] as string;
    const payload = req.body;

    // Only process pull request events
    if (event !== 'pull_request') {
      logger.info(`Ignoring non-pull request event: ${event}`);
      res.status(200).json({ message: 'Event ignored' });
      return;
    }

    // Only process opened, synchronize (updated), or reopened actions
    const validActions = ['opened', 'synchronize', 'reopened'];
    if (!validActions.includes(payload.action)) {
      logger.info(`Ignoring pull request action: ${payload.action}`);
      res.status(200).json({ message: 'Action ignored' });
      return;
    }

    const {
      pull_request: pullRequest,
      repository: repo,
      installation: { id: installationId }
    } = payload;

    // Find repository in our database
    const repository = await Repository.findOne({
      where: {
        githubId: repo.id.toString()
      }
    });

    // Skip if repository is not registered or disabled
    if (!repository || !repository.isEnabled) {
      logger.info(`Repository not registered or disabled: ${repo.full_name}`);
      res.status(200).json({ message: 'Repository not registered or disabled' });
      return;
    }

    // Create or update pull request record
    const [prRecord, created] = await PullRequest.findOrCreate<any>({
      where: {
        repositoryId: repository.id,
        prNumber: pullRequest.number
      },
      defaults: {
        title: pullRequest.title,
        authorUsername: pullRequest.user.login,
        status: 'pending',
        headSha: pullRequest.head.sha,
        baseSha: pullRequest.base.sha,
        htmlUrl: pullRequest.html_url,
        diffUrl: pullRequest.diff_url,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    // If PR exists, update it
    if (!created) {
      await prRecord.update({
        title: pullRequest.title,
        headSha: pullRequest.head.sha,
        baseSha: pullRequest.base.sha,
        status: 'pending',
        updatedAt: new Date()
      });
    }

    // Add to analysis queue
    await addToAnalysisQueue({
      prId: prRecord.id,
      repositoryId: repository.id,
      installationId,
      owner: repo.owner.login,
      repo: repo.name,
      prNumber: pullRequest.number,
      headSha: pullRequest.head.sha,
      baseSha: pullRequest.base.sha
    });

    logger.info(`Added PR #${pullRequest.number} to analysis queue for repository ${repo.full_name}`);
    res.status(202).json({ message: 'Pull request queued for analysis', prId: prRecord.id });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  }
};
