import { Router, Request, Response } from 'express';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

router.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
  res.json({ message: 'This is a protected route.' });
});

router.get('/user/progress', authMiddleware, async (req: Request, res: Response) => {
  const { db, getCurrentDay } = req.app.locals;
  try {
    const userId = (req as any).user.uid;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      user: { id: userDoc.id, ...userData },
      currentDay: getCurrentDay()
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

export default router;