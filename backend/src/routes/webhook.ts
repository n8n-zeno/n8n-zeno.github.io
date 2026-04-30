import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

router.post('/n8n-result', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, status, rawCode, error } = req.body;

    console.log(`[WEBHOOK] Received n8n-result for jobId: "${jobId}"`);
    console.log(`[WEBHOOK] Keys in req.body:`, Object.keys(req.body));
    console.log(`[WEBHOOK] Type of rawCode:`, typeof rawCode);
    console.log(`[WEBHOOK] rawCode is truthy:`, !!rawCode);

    if (!jobId || !status) {
      res.status(400).json({ error: 'jobId and status are required' });
      return;
    }

    const cleanJobId = String(jobId).trim();
    const job = await prisma.job.findUnique({ where: { jobId: cleanJobId } });
    
    if (!job) {
      console.log(`[WEBHOOK] ❌ Job not found in DB: "${cleanJobId}"`);
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // 🚀 NEW FIX: Check if rawCode is already a string to prevent double-stringify bloating
    let formattedResult = null;
    if (rawCode !== undefined && rawCode !== null) {
       formattedResult = typeof rawCode === 'string' ? rawCode : JSON.stringify(rawCode);
    }

    await prisma.job.update({
      where: { jobId: jobId },
      data: {
        status: status,
        rawCode: formattedResult,
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