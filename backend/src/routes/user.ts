import { Router, Response } from 'express';
import prisma from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.put('/figma-token', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { figmaToken } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { figmaToken },
    });
    res.json({ success: true, user: { id: user.id, email: user.email, figmaToken: user.figmaToken } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
