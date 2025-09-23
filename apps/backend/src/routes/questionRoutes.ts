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

// Helper to safely read nested fields
const getNested = (obj: any, path: string, fallback: any) => {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
};

const MAX_ATTEMPTS_PER_DAY = 10;
const WRONG_COOLDOWN_SECONDS = 30;

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

    // Fetch user's attempt/completion status
    const uid = (req as any).user.uid as string;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};

    const completedForDay = !!getNested(userData, `completed.day${currentDay}.done`, false);
    const attemptCount = Number(getNested(userData, `attempts.day${currentDay}.count`, 0));
    const cooldownUntilTs = getNested(userData, `attempts.day${currentDay}.cooldownUntil`, null);

    let cooldownSeconds = 0;
    if (cooldownUntilTs && cooldownUntilTs.toDate) {
      const now = new Date();
      const diffMs = cooldownUntilTs.toDate().getTime() - now.getTime();
      cooldownSeconds = Math.max(0, Math.ceil(diffMs / 1000));
    }

    res.json({
      id: questionDoc.id,
      day: currentDay,
      question: questionData.text,
      hint: questionData.hint,
      difficulty: questionData.difficulty,
      image: questionData.image,
      // User status
      isCompleted: completedForDay,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS_PER_DAY - attemptCount),
      cooldownSeconds,
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
    return res.status(400).json({ result: 'Missing day or answer' });
  }

  try {
    const uid = (req as any).user.uid as string;

    const questionRef = db.collection('questions').doc(`day${day}`);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      return res.status(400).json({ result: 'Question not found for this day' });
    }

    const questionData = questionDoc.data() as QuestionData;

    if (!questionData?.answer) {
      return res.status(500).json({ result: 'Question data is corrupted' });
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};

    // Prevent submissions if already completed
    const alreadyCompleted = !!getNested(userData, `completed.day${day}.done`, false);
    if (alreadyCompleted) {
      return res.status(200).json({
        result: 'Already completed for today',
        correct: true,
        attemptsLeft: Math.max(0, MAX_ATTEMPTS_PER_DAY - Number(getNested(userData, `attempts.day${day}.count`, 0))),
        cooldownSeconds: 0,
      });
    }

    // Enforce cooldown
    const cooldownUntil = getNested(userData, `attempts.day${day}.cooldownUntil`, null);
    if (cooldownUntil && cooldownUntil.toDate) {
      const now = new Date();
      const remainingMs = cooldownUntil.toDate().getTime() - now.getTime();
      const remainingSec = Math.ceil(remainingMs / 1000);
      if (remainingSec > 0) {
        return res.status(429).json({
          result: `Please wait ${remainingSec}s before your next attempt`,
          correct: false,
          attemptsLeft: Math.max(0, MAX_ATTEMPTS_PER_DAY - Number(getNested(userData, `attempts.day${day}.count`, 0))),
          cooldownSeconds: remainingSec,
        });
      }
    }

    // Enforce attempt limit
    const attemptCount = Number(getNested(userData, `attempts.day${day}.count`, 0));
    if (attemptCount >= MAX_ATTEMPTS_PER_DAY) {
      return res.status(429).json({
        result: 'Attempt limit reached for today',
        correct: false,
        attemptsLeft: 0,
        cooldownSeconds: 0,
      });
    }

    // Validate answer
    const isCorrect = String(answer).trim().toLowerCase() === String(questionData.answer).trim().toLowerCase();

    if (isCorrect) {
      // Mark completion and (optionally) record completion timestamp
      await userRef.set(
        {
          completed: {
            [`day${day}`]: {
              done: true,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
        },
        { merge: true }
      );

      return res.json({
        result: 'Success 🎉 Correct Answer!',
        correct: true,
        attemptsLeft: Math.max(0, MAX_ATTEMPTS_PER_DAY - attemptCount),
        cooldownSeconds: 0,
      });
    } else {
      // Wrong answer: increment attempts and set cooldown 30s from now
      const now = admin.firestore.Timestamp.now();
      const cooldownUntilTs = admin.firestore.Timestamp.fromMillis(now.toMillis() + WRONG_COOLDOWN_SECONDS * 1000);

      await userRef.set(
        {
          attempts: {
            [`day${day}`]: {
              count: attemptCount + 1,
              cooldownUntil: cooldownUntilTs,
            },
          },
        },
        { merge: true }
      );

      const attemptsLeft = Math.max(0, MAX_ATTEMPTS_PER_DAY - (attemptCount + 1));

      return res.status(200).json({
        result: 'Incorrect answer. Try again after cooldown.',
        correct: false,
        attemptsLeft,
        cooldownSeconds: WRONG_COOLDOWN_SECONDS,
      });
    }
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({ result: 'Error validating answer' });
  }
});

export default router;