import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { app } from "../lib/firebase";
import { getFirestore } from "firebase/firestore";

const db = getFirestore(app);

// Helper to parse unlockDate values that may come from Firestore Timestamps
// or from the backend as ISO strings or plain objects { seconds }.
const parseUnlockDate = (unlock: any): Date | null => {
  if (!unlock) return null;

  // Firestore Timestamp object with toDate()
  if (typeof unlock.toDate === "function") {
    try {
      return unlock.toDate();
    } catch (_) {
      return null;
    }
  }

  // ISO string
  if (typeof unlock === "string") {
    const d = new Date(unlock);
    return isNaN(d.getTime()) ? null : d;
  }

  // Firestore serialized as { seconds: number } or { _seconds }
  if (typeof unlock.seconds === "number") {
    return new Date(unlock.seconds * 1000);
  }
  if (typeof unlock._seconds === "number") {
    return new Date(unlock._seconds * 1000);
  }

  return null;
};

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Timestamp;
  completed: {
    [key: string]: {
      attempts: number;
      done: boolean;
      timestamp?: Timestamp;
      timestamps?: Timestamp[]; // Array of submission timestamps for cooldown tracking
    };
  };
}

export interface Question {
  id: string;
  day: number;
  text: string;
  answer: string;
  hint: string;
  difficulty: number;
  image?: string;
  unlockDate: Timestamp;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  completedAt: Timestamp;
  attempts: number; // Add attempts to leaderboard for more detailed ranking
  rank: number;
}

export interface CompletedDay {
  done: boolean;
  timestamp?: Timestamp;
  attempts: number;
  timestamps?: Timestamp[];
}

export interface UserProgress {
  totalCompleted: number;
  totalAttempts: number;
  averageAttempts: number;
  streak: number;
  completed: { [key: string]: CompletedDay };
}

export const getCurrentDay = async (user: any): Promise<number> => {
  const questions = await getAllQuestions(user); // already sorted by day ASC
  const now = new Date();

  // Count how many questions have unlockDate <= now. Support multiple
  // serialization formats for unlockDate (Timestamp, ISO string, object).
  let unlockedCount = 0;
  for (const q of questions) {
    const unlockDate = parseUnlockDate((q as any).unlockDate);
    if (unlockDate && unlockDate <= now) unlockedCount++;
  }

  // At least day 1 must be returned
  return Math.max(1, unlockedCount);
};

// Check if a day is unlocked based on question's unlock date
export const isDayUnlocked = async (day: number): Promise<boolean> => {
  const questionRef = doc(db, "questions", `day${day}`);
  const questionSnap = await getDoc(questionRef);

  if (!questionSnap.exists()) return false;

  const questionData = questionSnap.data() as Question;
  if (!questionData.unlockDate) return true; // If no unlock date, assume unlocked

  const unlockDate = parseUnlockDate((questionData as any).unlockDate);
  if (!unlockDate) return true; // If unparseable, be permissive and treat as unlocked
  const now = new Date();

  return now >= unlockDate;
};

// Get all unlocked days up to current day
export const getUnlockedDays = async (user: any): Promise<number[]> => {
  const currentDay = await getCurrentDay(user);
  const unlockedDays: number[] = [];

  for (let day = 1; day <= currentDay; day++) {
    const isUnlocked = await isDayUnlocked(day);
    if (isUnlocked) {
      unlockedDays.push(day);
    }
  }

  return unlockedDays;
};

// Create or update user profile
export const createOrUpdateUser = async (
  userId: string,
  userData: Partial<User>,
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user
    const newUser: User = {
      id: userId,
      name: userData.name || "",
      email: userData.email || "",
      createdAt: serverTimestamp() as Timestamp,
      completed: {},
    };
    await setDoc(userRef, newUser);
  } else {
    // Update existing user
    await updateDoc(userRef, {
      name: userData.name,
      email: userData.email,
    });
  }
};

// Mark a day as completed (deprecated - use backend submission instead)
export const markDayCompleted = async (
  userId: string,
  day: number,
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    [`completed.day${day}`]: {
      done: true,
      timestamp: serverTimestamp(),
      attempts: 1, // Default to 1 if not tracked
      timestamps: [serverTimestamp()],
    },
  });
};

// Check if user has completed a specific day
export const isDayCompleted = async (
  userId: string,
  day: number,
): Promise<boolean> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return false;

  const userData = userSnap.data() as User;
  return userData.completed[`day${day}`]?.done || false;
};

// Get user's day data including attempts and timestamps
export const getUserDayData = async (
  userId: string,
  day: number,
): Promise<CompletedDay | null> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data() as User;
  const dayData = userData.completed[`day${day}`];

  if (!dayData) return null;

  return {
    done: dayData.done,
    timestamp: dayData.timestamp,
    attempts: dayData.attempts || 0,
    timestamps: dayData.timestamps || [],
  };
};

// Get user's attempts for a specific day
export const getUserDayAttempts = async (
  userId: string,
  day: number,
): Promise<number> => {
  const dayData = await getUserDayData(userId, day);
  return dayData?.attempts || 0;
};

// Get user's progress with enhanced statistics
export const getUserProgress = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  return { id: userSnap.id, ...userSnap.data() } as User;
};

// Get user's detailed progress statistics
export const getUserProgressStats = async (
  userId: string,
): Promise<UserProgress | null> => {
  const user = await getUserProgress(userId);
  if (!user) return null;

  const completedDays = Object.values(user.completed).filter((day) => day.done);
  const totalCompleted = completedDays.length;
  const totalAttempts = Object.values(user.completed).reduce(
    (sum, day) => sum + (day.attempts || 0),
    0,
  );
  const averageAttempts =
    totalCompleted > 0 ? totalAttempts / totalCompleted : 0;

  // Calculate streak (consecutive days completed)
  let streak = 0;
  const currentDay = await getCurrentDay(user);
  for (let day = currentDay; day >= 1; day--) {
    if (user.completed[`day${day}`]?.done) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalCompleted,
    totalAttempts,
    averageAttempts,
    streak,
    completed: user.completed,
  };
};

export const getTodaysQuestion = async (user: any): Promise<any | null> => {
  if (!user) return null;

  const BACKEND =
    import.meta.env.VITE_BACKEND_SERVER_URL || "http://localhost:5000";

  const token = await user.getIdToken();
  const res = await fetch(`${BACKEND}/play`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch today's question");
  }

  return await res.json();
};

export const getAllQuestions = async (
  user: any,
): Promise<Omit<Question, "answer">[]> => {
  if (!user) throw new Error("Not authenticated");

  const BACKEND =
    import.meta.env.VITE_BACKEND_SERVER_URL || "http://localhost:5000";

  const token = await user.getIdToken();
  const res = await fetch(`${BACKEND}/questions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch questions");
  }

  const data = await res.json();
  return data.questions;
};

// Get daily leaderboard for a specific day with attempts tracking
export const getDailyLeaderboard = async (
  day: number,
  limitCount: number = 10,
): Promise<LeaderboardEntry[]> => {
  const q = query(
    collection(db, "users"),
    where(`completed.day${day}.done`, "==", true),
    orderBy(`completed.day${day}.timestamp`, "asc"),
    limit(limitCount),
  );

  const querySnapshot = await getDocs(q);
  const leaderboard: LeaderboardEntry[] = [];

  querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
    const userData = doc.data() as User;
    const completedData = userData.completed[`day${day}`];

    if (completedData?.timestamp) {
      leaderboard.push({
        id: doc.id,
        name: userData.name,
        email: userData.email,
        completedAt: completedData.timestamp,
        attempts: completedData.attempts || 1,
        rank: leaderboard.length + 1,
      });
    }
  });

  return leaderboard;
};

// Get enhanced leaderboard with attempts-based secondary sorting
export const getEnhancedDailyLeaderboard = async (
  day: number,
  limitCount: number = 10,
): Promise<LeaderboardEntry[]> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where(`completed.day${day}.done`, "==", true));

  const querySnapshot = await getDocs(q);
  const entries: LeaderboardEntry[] = [];

  querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
    const userData = doc.data() as User;
    const completedData = userData.completed[`day${day}`];

    if (completedData?.timestamp) {
      entries.push({
        id: doc.id,
        name: userData.name,
        email: userData.email,
        completedAt: completedData.timestamp,
        attempts: completedData.attempts || 1,
        rank: 0, // Will be set after sorting
      });
    }
  });

  // Sort by completion time first, then by fewer attempts as tiebreaker
  entries.sort((a, b) => {
    const timeComparison = a.completedAt.toMillis() - b.completedAt.toMillis();
    if (timeComparison !== 0) return timeComparison;
    return a.attempts - b.attempts; // Fewer attempts is better
  });

  // Assign ranks and limit results
  const rankedEntries = entries.slice(0, limitCount).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return rankedEntries;
};

// Get today's leaderboard
export const getTodaysLeaderboard = async (
  limitCount: number = 10,
): Promise<LeaderboardEntry[]> => {
  const currentDay = await getCurrentDay(undefined as any);
  return getEnhancedDailyLeaderboard(currentDay, limitCount);
};

// Get overall leaderboard (total completed days with average attempts)
export const getOverallLeaderboard = async (
  limitCount: number = 10,
): Promise<
  Array<{
    id: string;
    name: string;
    email: string;
    completedDays: number;
    totalAttempts: number;
    averageAttempts: number;
    rank: number;
  }>
> => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);

  const entries: Array<{
    id: string;
    name: string;
    email: string;
    completedDays: number;
    totalAttempts: number;
    averageAttempts: number;
    rank: number;
  }> = [];

  querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
    const userData = doc.data() as User;
    const completed = userData.completed || {};

    const completedDays = Object.values(completed).filter(
      (day) => day.done,
    ).length;
    const totalAttempts = Object.values(completed).reduce(
      (sum, day) => sum + (day.attempts || 0),
      0,
    );
    const averageAttempts =
      completedDays > 0 ? totalAttempts / completedDays : 0;

    if (completedDays > 0) {
      entries.push({
        id: doc.id,
        name: userData.name,
        email: userData.email,
        completedDays,
        totalAttempts,
        averageAttempts,
        rank: 0,
      });
    }
  });

  // Sort by completed days (descending), then by average attempts (ascending)
  entries.sort((a, b) => {
    if (a.completedDays !== b.completedDays) {
      return b.completedDays - a.completedDays;
    }
    return a.averageAttempts - b.averageAttempts;
  });

  // Assign ranks and limit results
  const rankedEntries = entries.slice(0, limitCount).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return rankedEntries;
};

// Submit answer and check if correct (deprecated - use backend endpoint instead)
export const submitAnswer = async (
  _userId: string,
  day: number,
  answer: string,
): Promise<{ correct: boolean; message: string }> => {
  console.warn(
    "submitAnswer function is deprecated. Use backend /play/submit endpoint instead.",
  );

  const questionRef = doc(db, "questions", `day${day}`);
  const questionSnap = await getDoc(questionRef);

  if (!questionSnap.exists()) {
    return { correct: false, message: "Question not found" };
  }

  const questionData = questionSnap.data() as Question;

  // Check if answer is correct (case-insensitive, trimmed)
  const isCorrect =
    answer.trim().toLowerCase() === questionData.answer.trim().toLowerCase();

  if (isCorrect) {
    // This should now be handled by the backend
    return {
      correct: true,
      message: "Correct! Use backend endpoint for proper tracking.",
    };
  } else {
    return { correct: false, message: "Incorrect answer. Try again!" };
  }
};

// Helper function to check if user is in cooldown (client-side estimation)
export const isUserInCooldown = (
  timestamps: Timestamp[],
  cooldownMs: number = 3000,
): boolean => {
  if (!timestamps || timestamps.length === 0) return false;

  const now = Date.now();
  const lastSubmission = timestamps[timestamps.length - 1];

  return now - lastSubmission.toMillis() < cooldownMs;
};

// Get user's submission history for a day
export const getUserSubmissionHistory = async (
  userId: string,
  day: number,
): Promise<Timestamp[]> => {
  const dayData = await getUserDayData(userId, day);
  return dayData?.timestamps || [];
};
