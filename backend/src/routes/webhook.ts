import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

router.post('/n8n-result', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, status, data, error } = req.body;

    if (!jobId || !status) {
      res.status(400).json({ error: 'jobId and status are required' });
      return;
    }

    const job = await prisma.compileJob.findUnique({ where: { id: jobId } });
    
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // 🚀 NEW FIX: Check if data is already a string to prevent double-stringify bloating
    let formattedResult = null;
    if (data !== undefined && data !== null) {
       formattedResult = typeof data === 'string' ? data : JSON.stringify(data);
    }

    await prisma.compileJob.update({
      where: { id: jobId },
      data: {
        status: status,
        result: formattedResult,
        error: typeof error === 'string' ? error : (error ? JSON.stringify(error) : null),
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error handling webhook' });
  }
});

export default router;