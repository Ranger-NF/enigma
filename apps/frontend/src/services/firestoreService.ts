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
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Timestamp;
  completed: {
    [key: string]: {
      done: boolean;
      timestamp?: Timestamp;
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
  rank: number;
}

// Get current day (1-10)
export const getCurrentDay = (): number => {
  const startDate = new Date('2025-09-21'); // Adjust this to your start date
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays, 1), 10); // Clamp between 1 and 10
};

// Create or update user profile
export const createOrUpdateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Create new user
    const newUser: User = {
      id: userId,
      name: userData.name || '',
      email: userData.email || '',
      createdAt: serverTimestamp() as Timestamp,
      completed: {}
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

// Mark a day as completed
export const markDayCompleted = async (userId: string, day: number): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    [`completed.day${day}`]: {
      done: true,
      timestamp: serverTimestamp()
    }
  });
};

// Check if user has completed a specific day
export const isDayCompleted = async (userId: string, day: number): Promise<boolean> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return false;
  
  const userData = userSnap.data() as User;
  return userData.completed[`day${day}`]?.done || false;
};

// Get user's progress
export const getUserProgress = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return null;
  
  return { id: userSnap.id, ...userSnap.data() } as User;
};

// Get today's question
export const getTodaysQuestion = async (): Promise<Question | null> => {
  const currentDay = getCurrentDay();
  const questionRef = doc(db, 'questions', `day${currentDay}`);
  const questionSnap = await getDoc(questionRef);
  
  if (!questionSnap.exists()) return null;
  
  return { id: questionSnap.id, ...questionSnap.data() } as Question;
};

// Get all questions (for admin purposes)
export const getAllQuestions = async (): Promise<Question[]> => {
  const questionsRef = collection(db, 'questions');
  const q = query(questionsRef, orderBy('day', 'asc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Question[];
};

// Get daily leaderboard for a specific day
export const getDailyLeaderboard = async (day: number, limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  const q = query(
    collection(db, 'users'),
    where(`completed.day${day}.done`, '==', true),
    orderBy(`completed.day${day}.timestamp`, 'asc'),
    limit(limitCount)
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
        rank: leaderboard.length + 1
      });
    }
  });
  
  return leaderboard;
};

// Get today's leaderboard
export const getTodaysLeaderboard = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  const currentDay = getCurrentDay();
  return getDailyLeaderboard(currentDay, limitCount);
};

// Submit answer and check if correct
export const submitAnswer = async (userId: string, day: number, answer: string): Promise<{ correct: boolean; message: string }> => {
  const questionRef = doc(db, 'questions', `day${day}`);
  const questionSnap = await getDoc(questionRef);
  
  if (!questionSnap.exists()) {
    return { correct: false, message: 'Question not found' };
  }
  
  const questionData = questionSnap.data() as Question;
  
  // Check if answer is correct (case-insensitive, trimmed)
  const isCorrect = answer.trim().toLowerCase() === questionData.answer.trim().toLowerCase();
  
  if (isCorrect) {
    // Mark day as completed
    await markDayCompleted(userId, day);
    return { correct: true, message: 'Correct! 🎉' };
  } else {
    return { correct: false, message: 'Incorrect answer. Try again!' };
  }
};
