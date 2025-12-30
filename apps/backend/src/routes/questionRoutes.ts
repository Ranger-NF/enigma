import { Router, Request, Response } from "express";
import admin from "firebase-admin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

import authMiddleware from "../../middleware/authMiddleware";
import { QuestionData } from "../types/questionTypes";
import {
  getCooldownInfo,
  isQuestionUnlockedByDate,
  isDayCompleted,
  checkSerialProgression,
  validateAnswer,
} from "../utilities/questionRouteHelpers";

type Timestamp = admin.firestore.Timestamp;

export interface Question {
  day: number;
  text: string;
  answer: string;
  hint: string | null;
  difficulty: number;
  image?: string;

  unlockDate: Timestamp;
  updatedAt: Timestamp;
}

const router = Router();

const WRONG_COOLDOWN_SECONDS = 30;
export const MAX_ATTEMPTS_BEFORE_COOLDOWN = 10;

router.get(
  "/questions",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { db } = req.app.locals;
    try {
      const questionsRef = db.collection("questions");
      const snapshot = await questionsRef.orderBy("day", "asc").get();

      const questions = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
        const data = doc.data() as Question;
        // Remove answer field to prevent exposure
        const { answer, ...safeData } = data;
        return {
          ...safeData,
        };
      }) as Omit<Question, "answer">[];

      res.json({ questions });
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  },
);

router.get(
  "/questions/day/:day",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { db } = req.app.locals;
    const day = Number(req.params.day);

    if (isNaN(day)) {
      return res.status(400).json({ error: "Invalid day" });
    }

    try {
      const snapshot = await db
        .collection("questions")
        .where("day", "==", day)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({ error: "Question not found" });
      }

      const doc = snapshot.docs[0];
      const data = doc.data() as Question;

      // remove answer before sending
      const { answer, ...safeData } = data;

      res.json({
        ...safeData,
      });
    } catch (error) {
      console.error("Error fetching question by day:", error);
      res.status(500).json({ error: "Failed to fetch question" });
    }
  },
);

router.get("/play", authMiddleware, async (req: Request, res: Response) => {
  const { db, getCurrentDay } = req.app.locals;

  try {
    // Parse requested day or use current day
    const requestedDay = req.query.day
      ? parseInt(req.query.day as string)
      : null;
    const currentDay = requestedDay || (await getCurrentDay());

    // Fetch question document
    const questionRef = db.collection("questions").doc(`day${currentDay}`);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      return res.status(404).json({
        error: `No question found for day ${currentDay}`,
        currentDay,
      });
    }

    const questionData = questionDoc.data() as QuestionData;

    // Check date-based unlock
    const isDateUnlocked = isQuestionUnlockedByDate(questionData.unlockDate);
    if (!isDateUnlocked) {
      return res.json({
        id: questionDoc.id,
        day: currentDay,
        question: "",
        hint: "",
        difficulty: 0,
        image: "",
        isCompleted: false,
        cooldownSeconds: 0,
        isUnlocked: false,
        lockReason: `This question will unlock on ${questionData.unlockDate.toDate().toLocaleString()}`,
        isCatchUp: false,
        dateLockedUntil: questionData.unlockDate.toDate().toISOString(),
      });
    }

    // Fetch user data
    const uid = (req as any).user.uid as string;
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};

    // Check serial progression
    const progression = await checkSerialProgression(
      currentDay,
      requestedDay,
      userData,
      getCurrentDay,
    );

    // Check completion status
    const completedForDay = isDayCompleted(userData, currentDay);

    // Get cooldown information
    const cooldownInfo = await getCooldownInfo(userData, userRef, currentDay);

    // Build response
    const response = {
      id: questionDoc.id,
      day: currentDay,
      question: questionData.text,
      hint: questionData.hint,
      difficulty: questionData.difficulty,
      image: questionData.image,
      // User status
      isCompleted: completedForDay,
      cooldownSeconds: cooldownInfo.remainingSeconds,
      attemptsInPeriod: cooldownInfo.attemptsInPeriod,
      attemptsBeforeCooldown: Math.max(
        0,
        MAX_ATTEMPTS_BEFORE_COOLDOWN - cooldownInfo.attemptsInPeriod,
      ),
      // Serial progression
      isUnlocked: progression.isUnlocked,
      lockReason: progression.lockReason,
      isCatchUp: progression.isCatchUp,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

/**
 * GET /progress - Get user's progress across all days
 * OPTIMIZED: Fetch all questions in parallel instead of sequentially
 */
router.get("/progress", authMiddleware, async (req: Request, res: Response) => {
  const { db, getCurrentDay } = req.app.locals;

  try {
    const snapshot = await db.collection("questions").get();
    const totalDays = snapshot.size;
    // Fetch user data
    const uid = (req as any).user.uid as string;
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};

    const currentDay = await getCurrentDay();

    // OPTIMIZATION: Fetch all question documents in parallel
    const questionPromises = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      return db.collection("questions").doc(`day${day}`).get();
    });

    const questionDocs = await Promise.all(questionPromises);

    // Build progress for each day
    const progress = questionDocs.map((questionDoc, index) => {
      const day = index + 1;

      // Check date unlock
      let isDateUnlocked = true;
      if (questionDoc.exists) {
        const questionData = questionDoc.data() as QuestionData;
        isDateUnlocked = isQuestionUnlockedByDate(questionData.unlockDate);
      }

      // Check completion
      const isCompleted = isDayCompleted(userData, day);

      // Determine accessibility
      let isAccessible = true;
      let reason = "";

      if (!isDateUnlocked) {
        isAccessible = false;
        reason = `Unlocks ${
          questionDoc.exists
            ? (questionDoc.data() as QuestionData).unlockDate
                .toDate()
                .toLocaleDateString()
            : "soon"
        }`;
      } else if (day > 1 && !isDayCompleted(userData, day - 1)) {
        isAccessible = false;
        reason = `Complete Day ${day - 1} first`;
      }

      return {
        day,
        isCompleted,

        isAccessible,
        reason,
        isCurrentDay: day === currentDay,
        isDateUnlocked,
      };
    });
    const isTutorialComplete = userData.completed?.tutorial?.done === true;

    // Calculate summary statistics
    const nextAvailableDay =
      progress.find((p) => !p.isCompleted && p.isAccessible)?.day || null;
    const allQuestionsComplete = progress.every(
      (p) => p.isCompleted || !p.isAccessible,
    );
    const hasIncompleteAccessible = progress.some(
      (p) => !p.isCompleted && p.isAccessible,
    );

    res.json({
      currentDay,
      progress,
      isTutorialComplete,
      totalCompleted: progress.filter((p) => p.isCompleted).length,
      totalDays: totalDays,
      nextAvailableDay,
      allQuestionsComplete,
      hasIncompleteAccessible,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

/**
 * POST /play/submit - Submit an answer for a specific day
 */
router.post(
  "/play/submit",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { db } = req.app.locals;
    const { day, answer } = req.body;
    const uid = (req as any).user.uid as string;

    // Validate input
    if (!day || !answer) {
      return res.status(400).json({ result: "Missing day or answer" });
    }

    try {
      // Fetch question
      const questionRef = db.collection("questions").doc(`day${day}`);
      const questionDoc = await questionRef.get();

      if (!questionDoc.exists) {
        return res
          .status(400)
          .json({ result: "Question not found for this day" });
      }

      const questionData = questionDoc.data() as QuestionData;

      if (!questionData?.answer) {
        return res.status(500).json({ result: "Question data is corrupted" });
      }

      // Check date-based unlock
      if (!isQuestionUnlockedByDate(questionData.unlockDate)) {
        return res.status(403).json({
          result: `This question is not yet available. It unlocks on ${questionData.unlockDate.toDate().toLocaleString()}`,
          correct: false,
          locked: true,
          dateLockedUntil: questionData.unlockDate.toDate().toISOString(),
        });
      }

      // Fetch user data
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();
      const userData = userDoc.exists ? userDoc.data() || {} : {};

      // Check serial progression
      if (day > 1 && !isDayCompleted(userData, day - 1)) {
        return res.status(403).json({
          result: `Complete Day ${day - 1} first to unlock this question`,
          correct: false,
          locked: true,
        });
      }

      // Check if already completed
      if (isDayCompleted(userData, day)) {
        return res.status(200).json({
          result: "Already completed for today",
          correct: true,
          cooldownSeconds: 0,
        });
      }

      // Check cooldown status
      const cooldownInfo = await getCooldownInfo(userData, userRef, day);

      if (cooldownInfo.isInCooldown) {
        return res.status(429).json({
          result: `Please wait ${cooldownInfo.remainingSeconds}s before your next attempt`,
          correct: false,
          cooldownSeconds: cooldownInfo.remainingSeconds,
          attemptsInPeriod: cooldownInfo.attemptsInPeriod,
          attemptsBeforeCooldown: Math.max(
            0,
            MAX_ATTEMPTS_BEFORE_COOLDOWN - cooldownInfo.attemptsInPeriod,
          ),
        });
      }

      // Validate answer
      const isCorrect = validateAnswer(answer, questionData.answer);

      if (isCorrect) {
        // Handle correct answer
        await userRef.set(
          {
            completed: {
              [`day${day}`]: {
                done: true,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
              },
            },
          },
          { merge: true },
        );

        return res.json({
          result: "Success 🎉 Correct Answer!",
          correct: true,
          cooldownSeconds: 0,
        });
      } else {
        // Handle wrong answer
        const now = admin.firestore.Timestamp.now();
        const newAttemptsInPeriod = cooldownInfo.attemptsInPeriod + 1;

        // Determine if cooldown should be triggered
        const shouldTriggerCooldown =
          newAttemptsInPeriod >= MAX_ATTEMPTS_BEFORE_COOLDOWN;
        const cooldownUntilTs = shouldTriggerCooldown
          ? admin.firestore.Timestamp.fromMillis(
              now.toMillis() + WRONG_COOLDOWN_SECONDS * 1000,
            )
          : null;
        const cooldownSecondsToReturn = shouldTriggerCooldown
          ? WRONG_COOLDOWN_SECONDS
          : 0;

        // Update database
        const updateData: any = {
          attempts: {
            [`day${day}`]: {
              attemptsInCooldownPeriod: newAttemptsInPeriod,
            },
          },
        };

        if (cooldownUntilTs) {
          updateData.attempts[`day${day}`].cooldownUntil = cooldownUntilTs;
        }

        await userRef.set(updateData, { merge: true });

        // Build response
        const attemptsBeforeCooldown = Math.max(
          0,
          MAX_ATTEMPTS_BEFORE_COOLDOWN - newAttemptsInPeriod,
        );
        const resultMessage = shouldTriggerCooldown
          ? `Incorrect answer. You've used ${newAttemptsInPeriod} attempts. Please wait ${cooldownSecondsToReturn}s before trying again.`
          : `Incorrect answer. ${attemptsBeforeCooldown} attempts left before cooldown.`;

        return res.status(200).json({
          result: resultMessage,
          correct: false,
          cooldownSeconds: cooldownSecondsToReturn,
          attemptsInPeriod: newAttemptsInPeriod,
          attemptsBeforeCooldown,
        });
      }
    } catch (error) {
      console.error("Error validating answer:", error);
      res.status(500).json({ result: "Error validating answer" });
    }
  },
);

router.post(
  "/play/tutorial-complete",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { db } = req.app.locals;
    const uid = (req as any).user.uid;

    try {
      const userRef = db.collection("users").doc(uid);

      await userRef.set(
        {
          completed: {
            tutorial: {
              done: true,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
        },
        { merge: true },
      );

      return res.json({
        result: "Tutorial completed 🎉",
        correct: true,
      });
    } catch (err) {
      console.error("Tutorial completion error", err);
      return res.status(500).json({ result: "Failed to complete tutorial" });
    }
  },
);

export default router;
