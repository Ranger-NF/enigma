import admin from "firebase-admin";
import { UserData, CooldownInfo } from "../types/questionTypes";

/**
 * Safely read nested fields from an object
 */
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

/**
 * Check if question is unlocked based on date
 */
export const isQuestionUnlockedByDate = (
  unlockDate: admin.firestore.Timestamp,
): boolean => {
  const now = new Date();
  const unlockDateTime = unlockDate.toDate();
  return now >= unlockDateTime;
};

/**
 * Get cooldown information for a user on a specific day
 */
export const getCooldownInfo = async (
  userData: UserData,
  userRef: admin.firestore.DocumentReference,
  day: number,
): Promise<CooldownInfo> => {
  let attemptsInPeriod = Number(
    getNested(userData, `attempts.day${day}.attemptsInCooldownPeriod`, 0),
  );

  const cooldownUntil = getNested(
    userData,
    `attempts.day${day}.cooldownUntil`,
    null,
  );

  if (!cooldownUntil || !cooldownUntil.toDate) {
    return {
      isInCooldown: false,
      remainingSeconds: 0,
      attemptsInPeriod,
    };
  }

  const now = new Date();
  const remainingMs = cooldownUntil.toDate().getTime() - now.getTime();
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  if (remainingSeconds > 0) {
    return {
      isInCooldown: true,
      remainingSeconds,
      attemptsInPeriod,
    };
  }

  // Cooldown has expired - reset the counter
  if (attemptsInPeriod >= MAX_ATTEMPTS_BEFORE_COOLDOWN) {
    attemptsInPeriod = 0;
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

  return {
    isInCooldown: false,
    remainingSeconds: 0,
    attemptsInPeriod,
  };
};

/**
 * Check if user has completed a specific day
 */
export const isDayCompleted = (userData: UserData, day: number): boolean => {
  return !!getNested(userData, `completed.day${day}.done`, false);
};

/**
 * Check serial progression and determine if day is accessible
 */
export const checkSerialProgression = (
  currentDay: number,
  requestedDay: number | null,
  userData: UserData,
  getCurrentDay: () => number,
): { isUnlocked: boolean; lockReason: string; isCatchUp: boolean } => {
  if (currentDay === 1) {
    return { isUnlocked: true, lockReason: "", isCatchUp: false };
  }

  const previousDayCompleted = isDayCompleted(userData, currentDay - 1);

  if (previousDayCompleted) {
    return { isUnlocked: true, lockReason: "", isCatchUp: false };
  }

  // Handle catch-up mode
  if (requestedDay) {
    const isPreviousDay = requestedDay < getCurrentDay();
    const isCurrentDay = requestedDay === getCurrentDay();

    if (isPreviousDay || isCurrentDay) {
      return {
        isUnlocked: true,
        lockReason: `Catch-up mode: Complete Day ${currentDay - 1} first for proper sequence`,
        isCatchUp: true,
      };
    }
  }

  return {
    isUnlocked: false,
    lockReason: `Complete Day ${currentDay - 1} to unlock this question`,
    isCatchUp: false,
  };
};

/**
 * Validate answer submission
 */
export const validateAnswer = (
  userAnswer: string,
  correctAnswer: string,
): boolean => {
  return (
    String(userAnswer).trim().toLowerCase() ===
    String(correctAnswer).trim().toLowerCase()
  );
};
