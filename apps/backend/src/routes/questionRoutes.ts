import { Router, Request, Response } from 'express';
import admin from 'firebase-admin';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

interface QuestionData {
  id: string;
  day: number;
  text: string;
  answer: string;
  hint: string;
  difficulty: number;
  image?: string;
  unlockDate: admin.firestore.Timestamp;
}

router.get('/play', authMiddleware, async (req: Request, res: Response) => {
  const { db, getCurrentDay } = req.app.locals;
  try {
    const currentDay = getCurrentDay();
    const questionRef = db.collection('questions').doc(`day${currentDay}`);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      return res.status(404).json({
        error: `No question found for day ${currentDay}`,
        currentDay
      });
    }

    const questionData = questionDoc.data() as QuestionData;

    res.json({
      id: questionDoc.id,
      day: currentDay,
      question: questionData.text,
      hint: questionData.hint,
      difficulty: questionData.difficulty,
      image: questionData.image
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

router.post('/play/submit', authMiddleware, async (req: Request, res: Response) => {
  const { db } = req.app.locals;
  const { day, answer } = req.body;

  if (!day || !answer) {
    return res.status(400).json({ result: "Missing day or answer" });
  }

  try {
    const questionRef = db.collection('questions').doc(`day${day}`);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      return res.status(400).json({ result: "Question not found for this day" });
    }

    const questionData = questionDoc.data() as QuestionData;

    if (!questionData?.answer) {
      return res.status(500).json({ result: "Question data is corrupted" });
    }

    const isCorrect = answer.trim().toLowerCase() === questionData.answer.trim().toLowerCase();

    if (isCorrect) {
      const userId = (req as any).user.uid;
      const userRef = db.collection('users').doc(userId);

      await userRef.update({
        [`completed.day${day}`]: {
          done: true,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }
      });

      return res.json({
        result: "Success 🎉 Correct Answer!",
        correct: true
      });
    } else {
      return res.json({
        result: "Incorrect answer. Try again!",
        correct: false
      });
    }
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({ result: "Error validating answer" });
  }
});

export default router;