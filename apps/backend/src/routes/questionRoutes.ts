import { Router, Request, Response } from 'express';
import admin from 'firebase-admin';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();

const MAX_ATTEMPTS_PER_DAY = 10;
const COOLDOWN_WINDOW_MS = 30000; // 30 seconds
const MAX_STORED_TIMESTAMPS = 5; // Keep last 5 timestamps for cooldown checking

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

interface CompletedDay {
  done: boolean;
  timestamp: admin.firestore.Timestamp;
  attempts: number;
  timestamps: admin.firestore.Timestamp[];
}

// Helper function to get user's completion data for a specific day
async function getUserDayData(db: admin.firestore.Firestore, userId: string, day: number): Promise<CompletedDay | null> {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    return null;
  }
  
  const userData = userDoc.data();
  const dayKey = `day${day}`;
  
  return userData?.completed?.[dayKey] || null;
}

// Helper function to check if user is in cooldown
function isInCooldown(timestamps: admin.firestore.Timestamp[]): boolean {
  if (!timestamps || timestamps.length === 0) return false;
  
  const now = Date.now();
  const lastSubmission = timestamps[timestamps.length - 1];
  
  return (now - lastSubmission.toMillis()) < COOLDOWN_WINDOW_MS;
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

    // Get user's attempts data
    const userId = (req as any).user.uid;
    const dayData = await getUserDayData(db, userId, currentDay);
    
    const attemptsUsed = dayData?.attempts || 0;
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS_PER_DAY - attemptsUsed);

    res.json({
      id: questionDoc.id,
      day: currentDay,
      question: questionData.text,
      hint: questionData.hint,
      difficulty: questionData.difficulty,
      image: questionData.image,
      attemptsLeft,
      maxAttempts: MAX_ATTEMPTS_PER_DAY
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

router.post('/play/submit', authMiddleware, async (req: Request, res: Response) => {
  const { db } = req.app.locals;
  const { day, answer } = req.body;
  const userId = (req as any).user.uid;

  if (!day || !answer) {
    return res.status(400).json({ result: "Missing day or answer" });
  }

  try {
    // Get current user data
    const dayData = await getUserDayData(db, userId, day);
    
    // Check if already completed
    if (dayData?.done) {
      return res.json({
        result: "Already completed today's challenge",
        correct: false,
        attemptsLeft: Math.max(0, MAX_ATTEMPTS_PER_DAY - (dayData.attempts || 0))
      });
    }

    // Check attempts limit
    const attemptsUsed = dayData?.attempts || 0;
    if (attemptsUsed >= MAX_ATTEMPTS_PER_DAY) {
      return res.json({
        result: "No attempts left for today",
        correct: false,
        attemptsLeft: 0
      });
    }

    // Check cooldown
    const timestamps = dayData?.timestamps || [];
    if (isInCooldown(timestamps)) {
      return res.json({
        result: "Please wait before trying again",
        correct: false,
        cooldown: true,
        attemptsLeft: Math.max(0, MAX_ATTEMPTS_PER_DAY - attemptsUsed)
      });
    }

    // Get question data
    const questionRef = db.collection('questions').doc(`day${day}`);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      return res.status(400).json({ result: "Question not found for this day" });
    }

    const questionData = questionDoc.data() as QuestionData;

    if (!questionData?.answer) {
      return res.status(500).json({ result: "Question data is corrupted" });
    }

    // Update timestamps and attempts
    const now = admin.firestore.Timestamp.now();
    const updatedTimestamps = [...timestamps, now].slice(-MAX_STORED_TIMESTAMPS);
    const newAttemptsUsed = attemptsUsed + 1;
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS_PER_DAY - newAttemptsUsed);

    // Check if answer is correct
    const isCorrect = answer.trim().toLowerCase() === questionData.answer.trim().toLowerCase();

    const userRef = db.collection('users').doc(userId);
    const dayKey = `day${day}`;

    if (isCorrect) {
      // Mark as completed
      await userRef.update({
        [`completed.${dayKey}`]: {
          done: true,
          timestamp: now,
          attempts: newAttemptsUsed,
          timestamps: updatedTimestamps
        }
      });

      return res.json({
        result: "Success 🎉 Correct Answer!",
        correct: true,
        attemptsLeft
      });
    } else {
      // Update attempts and timestamps without marking as done
      const updateData: any = {
        [`completed.${dayKey}.attempts`]: newAttemptsUsed,
        [`completed.${dayKey}.timestamps`]: updatedTimestamps
      };

      // If this is the first attempt, also set done: false
      if (!dayData) {
        updateData[`completed.${dayKey}.done`] = false;
      }

      await userRef.update(updateData);

      // Check if this was the last attempt
      if (attemptsLeft === 0) {
        return res.json({
          result: "Incorrect answer. No more attempts left for today.",
          correct: false,
          attemptsLeft: 0
        });
      }

      return res.json({
        result: `Incorrect answer. ${attemptsLeft} attempts remaining.`,
        correct: false,
        attemptsLeft
      });
    }
  } catch (error) {
    console.error('Error validating answer:', error);
    res.status(500).json({ result: "Error validating answer" });
  }
});

export default router;