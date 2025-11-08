import admin from "firebase-admin";

export interface QuestionData {
  id: string;
  day: number;
  text: string;
  answer: string;
  hint: string;
  difficulty: number;
  image?: string;
  unlockDate: admin.firestore.Timestamp;
}

export interface UserData {
  completed?: Record<string, any>;
  attempts?: Record<string, any>;
}

export interface CooldownInfo {
  isInCooldown: boolean;
  remainingSeconds: number;
  attemptsInPeriod: number;
}
