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

    // Pre-flight check to verify token is still valid
    const preflight = await fetch('https://api.figma.com/v1/me', {
      headers: { 'X-Figma-Token': user.figmaToken },
    });

    if (!preflight.ok) {
      const errorData = await preflight.json().catch(() => ({}));
      // If the token is truly invalid or expired, Figma returns an explicit error.
      // If it's a 403 with "Insufficient scope", the token is still valid but just lacks the scope for /v1/me,
      // which is fine since we only need "File content" read access for compilation.
      if (preflight.status === 401 || (preflight.status === 403 && errorData.err === 'Invalid token')) {
        res.status(401).json({ error: 'FIGMA_TOKEN_EXPIRED', message: 'Your Figma token has expired or is invalid.' });
        return;
      }
    }

    // Proxy request to n8n webhook
    const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/compile-figma';
    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        figmaUrl: url,
        figmaToken: user.figmaToken,
        outputFormat: outputFormat,
        format: outputFormat,
        react: outputFormat === 'react',
        html: outputFormat === 'html'
      }),
    });

    if (!n8nResponse.ok) {
      // If n8n failed for another reason
      res.status(n8nResponse.status).json({ error: 'n8n Webhook failed' });
      return;
    }

    const data = await n8nResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Compile proxy error:', error);
    res.status(500).json({ error: 'Internal server error while compiling' });
  }
});

export default router;
