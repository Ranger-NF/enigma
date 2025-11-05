import { Router, Request, Response } from "express";
import admin from "firebase-admin";
import authMiddleware from "../../middleware/authMiddleware";

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
  return (
    path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
        obj,
      ) ?? fallback
  );
};

// Helper to check if question is unlocked based on date
const isQuestionUnlockedByDate = (unlockDate: admin.firestore.Timestamp): boolean => {
  const now = new Date();
  const unlockDateTime = unlockDate.toDate();
  return now >= unlockDateTime;
};

const WRONG_COOLDOWN_SECONDS = 30;
const MAX_ATTEMPTS_BEFORE_COOLDOWN = 10; // Number of attempts allowed before triggering cooldown

router.get("/play", authMiddleware, async (req: Request, res: Response) => {
  const { db, getCurrentDay } = req.app.locals;

  try {
    // Allow requesting specific day via query parameter, otherwise use current day
    const requestedDay = req.query.day ? parseInt(req.query.day as string) : null;
    const currentDay = requestedDay || getCurrentDay();
    const questionRef = db.collection("questions").doc(`day${currentDay}`);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      return res.status(404).json({
        error: `No question found for day ${currentDay}`,
        currentDay,
      });
    }

    const questionData = questionDoc.data() as QuestionData;

    // Check if question is unlocked by date
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
        attemptsLeft: 0,
        cooldownSeconds: 0,
        isUnlocked: false,
        lockReason: `This question will unlock on ${questionData.unlockDate.toDate().toLocaleString()}`,
        isCatchUp: false,
        dateLockedUntil: questionData.unlockDate.toDate().toISOString(),
      });
    }

    // Fetch user's attempt/completion status
    const uid = (req as any).user.uid as string;
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};

    // Check serial progression logic
    let isUnlocked = true;
    let lockReason = "";
    let isCatchUp = false;

    console.log(`Checking progression for day ${currentDay}, requestedDay: ${requestedDay}`);

    if (currentDay > 1) {
      const previousDayCompleted = !!getNested(
        userData,
        `completed.day${currentDay - 1}.done`,
        false,
      );
      
      console.log(`Previous day ${currentDay - 1} completed:`, previousDayCompleted);
      
      if (!previousDayCompleted) {
        // If requesting a specific day (catch-up mode), only allow if it's a previous day or current day
        if (requestedDay) {
          // Only allow catch-up for days that are actually accessible
          // Check if this is a previous day that should be accessible
          const isPreviousDay = requestedDay < getCurrentDay();
          const isCurrentDay = requestedDay === getCurrentDay();
          
          if (isPreviousDay || isCurrentDay) {
            isCatchUp = true;
            isUnlocked = true;
            lockReason = `Catch-up mode: Complete Day ${currentDay - 1} first for proper sequence`;
          } else {
            // Future days should be locked even in catch-up mode
            isUnlocked = false;
            lockReason = `Complete Day ${currentDay - 1} to unlock this question`;
          }
        } else {
          // If requesting current day, enforce strict progression
          isUnlocked = false;
          lockReason = `Complete Day ${currentDay - 1} to unlock this question`;
        }
      }
    }

    const completedForDay = !!getNested(
      userData,
      `completed.day${currentDay}.done`,
      false,
    );
    const cooldownUntilTs = getNested(
      userData,
      `attempts.day${currentDay}.cooldownUntil`,
      null,
    );

    // Get attempts in current cooldown period
    let attemptsInPeriod = Number(
      getNested(userData, `attempts.day${currentDay}.attemptsInCooldownPeriod`, 0),
    );

    let cooldownSeconds = 0;
    if (cooldownUntilTs && cooldownUntilTs.toDate) {
      const now = new Date();
      const diffMs = cooldownUntilTs.toDate().getTime() - now.getTime();
      if (diffMs > 0) {
        cooldownSeconds = Math.ceil(diffMs / 1000);
      } else {
        // Cooldown has expired - reset the counter
        if (attemptsInPeriod >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
          attemptsInPeriod = 0;
          // Clear the cooldown data from database
          await userRef.set(
            {
              attempts: {
                [`day${currentDay}`]: {
                  attemptsInCooldownPeriod: 0,
                  cooldownUntil: admin.firestore.FieldValue.delete(),
                },
              },
            },
            { merge: true },
          );
        }
      }
    }

    const response = {
      id: questionDoc.id,
      day: currentDay,
      question: questionData.text,
      hint: questionData.hint,
      difficulty: questionData.difficulty,
      image: questionData.image,
      // User status
      isCompleted: completedForDay,
      cooldownSeconds,
      attemptsInPeriod,
      attemptsBeforeCooldown: Math.max(0, MAX_ATTEMPTS_BEFORE_COOLDOWN - attemptsInPeriod),
      // Serial progression
      isUnlocked,
      lockReason,
      isCatchUp,
    };
    
    console.log(`Response for day ${currentDay}:`, { isUnlocked, isCatchUp, lockReason });
    res.json(response);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

// Get user's progress across all days
router.get("/progress", authMiddleware, async (req: Request, res: Response) => {
  const { db, getCurrentDay } = req.app.locals;

  try {
    const uid = (req as any).user.uid as string;
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};

    const currentDay = getCurrentDay();
    const progress = [];

    for (let day = 1; day <= 10; day++) {
      const questionRef = db.collection("questions").doc(`day${day}`);
      const questionDoc = await questionRef.get();
      
      let isDateUnlocked = true;
      if (questionDoc.exists) {
        const questionData = questionDoc.data() as QuestionData;
        isDateUnlocked = isQuestionUnlockedByDate(questionData.unlockDate);
      }

      const isCompleted = !!getNested(
        userData,
        `completed.day${day}.done`,
        false,
      );

      // Determine if this day is accessible
      let isAccessible = true;
      let reason = "";

      // First check date unlock
      if (!isDateUnlocked) {
        isAccessible = false;
        reason = `Unlocks ${questionDoc.exists ?
          (questionDoc.data() as QuestionData).unlockDate.toDate().toLocaleDateString() :
          'soon'
        }`;
      } else if (day > 1) {
        // Then check serial progression
        const previousDayCompleted = !!getNested(
          userData,
          `completed.day${day - 1}.done`,
          false,
        );

        if (!previousDayCompleted) {
          isAccessible = false;
          reason = `Complete Day ${day - 1} first`;
        }
      }

      progress.push({
        day,
        isCompleted,
        isAccessible,
        reason,
        isCurrentDay: day === currentDay,
        isDateUnlocked,
      });
    }

    // Calculate additional helpful fields
    const nextAvailableDay = progress.find(p => !p.isCompleted && p.isAccessible)?.day || null;
    const allQuestionsComplete = progress.every(p => p.isCompleted || !p.isAccessible);
    const hasIncompleteAccessible = progress.some(p => !p.isCompleted && p.isAccessible);

    res.json({
      currentDay,
      progress,
      totalCompleted: progress.filter(p => p.isCompleted).length,
      totalDays: 10,
      nextAvailableDay,
      allQuestionsComplete,
      hasIncompleteAccessible,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

router.post(
  "/play/submit",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { db } = req.app.locals;
    const { day, answer } = req.body;
    const userId = (req as any).user.uid;

    if (!day || !answer) {
      return res.status(400).json({ result: "Missing day or answer" });
    }

    try {
      const uid = (req as any).user.uid as string;

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

      // Check if question is unlocked by date
      const isDateUnlocked = isQuestionUnlockedByDate(questionData.unlockDate);

      if (!isDateUnlocked) {
        return res.status(403).json({
          result: `This question is not yet available. It unlocks on ${questionData.unlockDate.toDate().toLocaleString()}`,
          correct: false,
          locked: true,
          dateLockedUntil: questionData.unlockDate.toDate().toISOString(),
        });
      }

      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();
      const userData = userDoc.exists ? userDoc.data() || {} : {};

      // Check serial progression - prevent submission to locked questions
      const previousDay = day - 1;
      if (day > 1) {
        const previousDayCompleted = !!getNested(
          userData,
          `completed.day${previousDay}.done`,
          false,
        );
        
        if (!previousDayCompleted) {
          return res.status(403).json({
            result: `Complete Day ${previousDay} first to unlock this question`,
            correct: false,
            locked: true,
          });
        }
      }

      // Prevent submissions if already completed
      const alreadyCompleted = !!getNested(
        userData,
        `completed.day${day}.done`,
        false,
      );
      if (alreadyCompleted) {
        return res.status(200).json({
          result: "Already completed for today",
          correct: true,
          cooldownSeconds: 0,
        });
      }

      // Get attempts in current cooldown period
      let attemptsInPeriod = Number(
        getNested(userData, `attempts.day${day}.attemptsInCooldownPeriod`, 0),
      );

      // Enforce cooldown
      const cooldownUntil = getNested(
        userData,
        `attempts.day${day}.cooldownUntil`,
        null,
      );

      let isInCooldown = false;
      let cooldownRemainingSec = 0;

      if (cooldownUntil && cooldownUntil.toDate) {
        const now = new Date();
        const remainingMs = cooldownUntil.toDate().getTime() - now.getTime();
        cooldownRemainingSec = Math.ceil(remainingMs / 1000);
        if (cooldownRemainingSec > 0) {
          isInCooldown = true;
        } else {
          // Cooldown has expired - reset the counter
          if (attemptsInPeriod >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
            attemptsInPeriod = 0;
            // Clear the cooldown data from database
            await userRef.set(
              {
                attempts: {
                  [`day${day}`]: {
                    attemptsInCooldownPeriod: 0,
                    cooldownUntil: admin.firestore.FieldValue.delete(),
                  },
                },
              },
              { merge: true },
            );
          }
        }
      }

      if (isInCooldown) {
        return res.status(429).json({
          result: `Please wait ${cooldownRemainingSec}s before your next attempt`,
          correct: false,
          cooldownSeconds: cooldownRemainingSec,
          attemptsInPeriod,
          attemptsBeforeCooldown: Math.max(0, MAX_ATTEMPTS_BEFORE_COOLDOWN - attemptsInPeriod),
        });
      }

      // Validate answer
      const isCorrect =
        String(answer).trim().toLowerCase() ===
        String(questionData.answer).trim().toLowerCase();

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
          { merge: true },
        );

        return res.json({
          result: "Success 🎉 Correct Answer!",
          correct: true,
          cooldownSeconds: 0,
        });
      } else {
        // Wrong answer: increment attempts in current period
        const now = admin.firestore.Timestamp.now();
        const newAttemptsInPeriod = attemptsInPeriod + 1;

        // Check if we need to trigger cooldown (after 10 attempts)
        let cooldownUntilTs = null;
        let cooldownSecondsToReturn = 0;

        if (newAttemptsInPeriod >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
          // Trigger cooldown after 10 attempts
          cooldownUntilTs = admin.firestore.Timestamp.fromMillis(
            now.toMillis() + WRONG_COOLDOWN_SECONDS * 1000,
          );
          cooldownSecondsToReturn = WRONG_COOLDOWN_SECONDS;
        }

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

        const attemptsBeforeCooldown = Math.max(
          0,
          MAX_ATTEMPTS_BEFORE_COOLDOWN - newAttemptsInPeriod,
        );

        const resultMessage = cooldownSecondsToReturn > 0
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

export default router;