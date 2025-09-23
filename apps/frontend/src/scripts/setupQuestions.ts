// This script helps set up the 10-day treasure hunt questions in Firestore
// Run this in the browser console or as a Node.js script

import {  doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface QuestionData {
  day: number;
  text: string;
  answer: string;
  hint: string;
  difficulty: number;
  image?: string;
  unlockDate: Date | any;
}

// Sample questions for the 10-day treasure hunt
const sampleQuestions: QuestionData[] = [
  {
    day: 1,
    text: "What is the capital city of France?",
    answer: "Paris",
    hint: "The city of lights",
    difficulty: 1,
    unlockDate: serverTimestamp()
  },
  {
    day: 2,
    text: "What is 15 + 27?",
    answer: "42",
    hint: "Add the numbers together",
    difficulty: 1,
    unlockDate: serverTimestamp()
  },
  {
    day: 3,
    text: "What is the largest planet in our solar system?",
    answer: "Jupiter",
    hint: "It's a gas giant",
    difficulty: 2,
    unlockDate: serverTimestamp()
  },
  {
    day: 4,
    text: "What is the chemical symbol for gold?",
    answer: "Au",
    hint: "From the Latin word 'aurum'",
    difficulty: 2,
    unlockDate: serverTimestamp()
  },
  {
    day: 5,
    text: "Who painted the Mona Lisa?",
    answer: "Leonardo da Vinci",
    hint: "Italian Renaissance artist",
    difficulty: 3,
    unlockDate: serverTimestamp()
  },
  {
    day: 6,
    text: "What is the square root of 144?",
    answer: "12",
    hint: "12 × 12 = 144",
    difficulty: 2,
    unlockDate: serverTimestamp()
  },
  {
    day: 7,
    text: "What is the smallest country in the world?",
    answer: "Vatican City",
    hint: "Located within Rome",
    difficulty: 3,
    unlockDate: serverTimestamp()
  },
  {
    day: 8,
    text: "What is the speed of light in a vacuum?",
    answer: "299,792,458 meters per second",
    hint: "Approximately 3 × 10^8 m/s",
    difficulty: 4,
    unlockDate: serverTimestamp()
  },
  {
    day: 9,
    text: "What is the name of the process by which plants make their own food?",
    answer: "Photosynthesis",
    hint: "Uses sunlight, water, and carbon dioxide",
    difficulty: 3,
    unlockDate: serverTimestamp()
  },
  {
    day: 10,
    text: "What is the mathematical constant π (pi) approximately equal to?",
    answer: "3.14159",
    hint: "The ratio of a circle's circumference to its diameter",
    difficulty: 4,
    unlockDate: serverTimestamp()
  }
];

export const setupQuestions = async () => {
  try {
    console.log('Setting up treasure hunt questions...');

    for (const question of sampleQuestions) {
      const questionRef = doc(db, 'questions', `day${question.day}`);
      await setDoc(questionRef, question);
      console.log(`✅ Added Day ${question.day}: ${question.text}`);
    }

    console.log('🎉 All questions have been set up successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error setting up questions:', error);
    return false;
  }
};

// Function to add a single question
export const addQuestion = async (questionData: QuestionData) => {
  try {
    const questionRef = doc(db, 'questions', `day${questionData.day}`);
    await setDoc(questionRef, questionData);
    console.log(`✅ Added Day ${questionData.day}: ${questionData.text}`);
    return true;
  } catch (error) {
    console.error('❌ Error adding question:', error);
    return false;
  }
};

// Function to update an existing question
export const updateQuestion = async (day: number, questionData: Partial<QuestionData>) => {
  try {
    const questionRef = doc(db, 'questions', `day${day}`);
    await setDoc(questionRef, questionData, { merge: true });
    console.log(`✅ Updated Day ${day}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating question:', error);
    return false;
  }
};

// Usage instructions
console.log(`
🔧 Treasure Hunt Question Setup Script

To set up all 10 questions, run:
  setupQuestions()

To add a single question:
  addQuestion({
    day: 1,
    text: "Your question here?",
    answer: "Correct Answer",
    hint: "Helpful hint",
    difficulty: 1,
    unlockDate: serverTimestamp()
  })

To update an existing question:
  updateQuestion(1, { text: "New question text" })
`);
