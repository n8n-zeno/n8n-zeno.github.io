import { Router, Response } from 'express';
import prisma from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

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

    const job = await prisma.compileJob.create({
      data: {
        userId: user.id,
        status: 'pending',
      }
    });

    const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/compile-figma';
    fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: job.id,
        figmaUrl: url,
        figmaToken: user.figmaToken,
        outputFormat: outputFormat,
        format: outputFormat,
        react: outputFormat === 'react',
        html: outputFormat === 'html'
      }),
    }).catch(error => console.error("Error triggering n8n webhook:", error));

    res.status(202).json({ jobId: job.id, status: 'pending' });

  } catch (error) {
    console.error('Compile proxy error:', error);
    res.status(500).json({ error: 'Internal server error while compiling' });
  }
});

router.get('/status/:jobId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobId = req.params.jobId as string;

    const job = await prisma.compileJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.userId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // 🚀 NEW FIX: Let express safely encode the massive string.
    // This avoids the JSON.parse memory crash but prevents invalid JSON formats.
    res.json({
      status: job.status,
      error: job.error,
      result: job.result
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Internal server error while checking status' });
  }
});

export default router;