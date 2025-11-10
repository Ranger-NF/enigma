import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface Question {
  id: string;
  day: number;
  text: string;
  hint: string;
  difficulty: number;
  answer: string;
  image?: string; // stores the public image URL now
  unlockDate: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Get all questions
export const getAllQuestions = async (): Promise<Question[]> => {
  try {
    const q = query(collection(db, 'questions'), orderBy('day', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt || Timestamp.now(),
      updatedAt: doc.data().updatedAt || Timestamp.now(),
    })) as Question[];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Get single question
export const getQuestion = async (day: number): Promise<Question | null> => {
  try {
    const docRef = doc(db, 'questions', `day${day}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt || Timestamp.now(),
        updatedAt: docSnap.data().updatedAt || Timestamp.now(),
      } as Question;
    }
    return null;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

// ✅ Upload image to Firebase Storage and get its public download URL
export const uploadQuestionImage = async (
  file: File,
  day: number
): Promise<string> => {
  try {
    const ext = file.name.split('.').pop();
    const storageRef = ref(storage, `questions/day${day}/image.${ext}`);
    await uploadBytes(storageRef, file);

    // get the public https URL (used in <img src=...>)
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteQuestionImage = async (day: number): Promise<void> => {
  try {
    const storageRef = ref(storage, `questions/day${day}/image.png`);
    try {
      await deleteObject(storageRef);
    } catch (e) {
      console.log('Image not found, skipping deletion');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Create question
export const createQuestion = async (
  day: number,
  questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  try {
    const docRef = doc(db, 'questions', `day${day}`);
    await setDoc(docRef, {
      ...questionData,
      day,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Update question
export const updateQuestion = async (
  day: number,
  questionData: Partial<Omit<Question, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'questions', `day${day}`);
    await updateDoc(docRef, {
      ...questionData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (day: number): Promise<void> => {
  try {
    await deleteQuestionImage(day);
    const docRef = doc(db, 'questions', `day${day}`);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
