import { Router, Response } from 'express';
import prisma from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import PQueue from 'p-queue';

const router = Router();

// Initialize PQueue with concurrency 3
const queue = new PQueue({ concurrency: 3 });

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url, outputFormat } = req.body;
    
    if (!url) {
      res.status(400).json({ error: 'Figma URL is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user || !user.figmaToken) {
      res.status(400).json({ error: 'Figma token not configured for this user. Please update it in settings.' });
      return;
    }

    const preflight = await fetch('https://api.figma.com/v1/me', {
      headers: { 'X-Figma-Token': user.figmaToken },
    });

    if (!preflight.ok) {
      const errorData = await preflight.json().catch(() => ({}));
      if (preflight.status === 401 || (preflight.status === 403 && errorData.err === 'Invalid token')) {
        res.status(401).json({ error: 'FIGMA_TOKEN_EXPIRED', message: 'Your Figma token has expired or is invalid.' });
        return;
      }
    }

    // a) Accept the 50MB payload and immediately save it to PostgreSQL via Prisma with a status of 'pending'
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        status: 'pending',
        inputPayload: req.body, // Saving the payload
        figmaUrl: url
      }
    });

    // b) Immediately return a 202 Accepted response to the frontend
    res.status(202).json({ message: "Job Queued", jobId: job.jobId, status: 'pending' });

    // c) Add the job to a PQueue instance configured with concurrency: 3
    // d) The queue worker should then be the function that actually fires the internal HTTP request
    queue.add(async () => {
      try {
        const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://n8n:5678/webhook/compile-figma';
        
        const response = await fetch(n8nUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Zeno-Secret': process.env.N8N_API_KEY || 'default_dev_key'
          },
          body: JSON.stringify({
            jobId: job.jobId,
            figmaUrl: url,
            figmaToken: user.figmaToken,
            outputFormat: outputFormat,
            format: outputFormat,
            react: outputFormat === 'react',
            html: outputFormat === 'html'
          }),
        });

        if (!response.ok) {
          throw new Error(`n8n responded with ${response.status}`);
        }
      } catch (error) {
        console.error(`Error processing job ${job.jobId} in queue:`, error);
        // Update job status to failed if n8n trigger fails
        await prisma.job.update({
          where: { jobId: job.jobId },
          data: { 
            status: 'failed',
            error: error instanceof Error ? error.message : 'Failed to trigger n8n webhook'
          }
        });
      }
    });

  } catch (error) {
    console.error('Compile proxy error:', error);
    res.status(500).json({ error: 'Internal server error while compiling' });
  }
});

router.get('/status/:jobId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobId = req.params.jobId as string;

    const job = await prisma.job.findUnique({
      where: { jobId: jobId },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json({
      status: job.status,
      error: job.error,
      result: job.rawCode
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Internal server error while checking status' });
  }
});

export default router;
