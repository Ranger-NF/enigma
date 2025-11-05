import { useState } from "react";

export interface QuestionResponse {
  id: string;
  day: number;
  question: string;
  hint: string;
  difficulty: number;
  image?: string;
  attemptsBeforeCooldown: number;
  attemptsInPeriod: number;
  isCompleted?: boolean;
  cooldownSeconds?: number;
  isUnlocked?: boolean;
  lockReason?: string;
  isCatchUp?: boolean;
  dateLockedUntil?: string;
}

/**
 * Custom hook to manage question fetching and state
 */
export const useQuestion = (
  user: any,
  setAttemptsBeforeCooldown: (val: number) => void,
  setAttemptsInPeriod: (val: number) => void,
  setCooldownSeconds: (val: number) => void,
  setIsUnlocked: (val: boolean) => void,
  setLockReason: (val: string) => void,
  setIsCatchUp: (val: boolean) => void
) => {
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [displayDay, setDisplayDay] = useState(1);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [dateLockedUntil, setDateLockedUntil] = useState<string | null>(null);
  const [result, setResult] = useState("");

  const fetchQuestion = async (day?: number) => {
    if (!user) return;

    setQuestionLoading(true);
    setResult("");

    try {
      const token = await user.getIdToken();
      const url = day
        ? `${import.meta.env.VITE_BACKEND_SERVER_URL || "http://localhost:5000"}/play?day=${day}`
        : `${import.meta.env.VITE_BACKEND_SERVER_URL || "http://localhost:5000"}/play`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        setResult(errorData.error || `Server error: ${response.status}`);
        return;
      }

      const data: QuestionResponse = await response.json();

      setDisplayDay(data.day);

      // Handle unlock date logic
      if (data.dateLockedUntil) {
        setDateLockedUntil(data.dateLockedUntil);
        setIsUnlocked(false);
        setLockReason(data.lockReason || "This question is not yet available");
        setQuestion("");
        setHint("");
        setDifficulty(1);
      } else if (data.isUnlocked || data.isCatchUp) {
        setQuestion(data.question || "");
        setHint(data.hint || "");
        setDifficulty(data.difficulty || 1);
        setDateLockedUntil(null);
      } else {
        setQuestion("");
        setHint("");
        setDifficulty(1);
        setDateLockedUntil(null);
      }

      setIsCompleted(data.isCompleted || false);
      setAttemptsBeforeCooldown(data.attemptsBeforeCooldown ?? 10);
      setAttemptsInPeriod(data.attemptsInPeriod ?? 0);
      setCooldownSeconds(data.cooldownSeconds || 0);
      setIsUnlocked(data.isUnlocked || false);
      setLockReason(data.lockReason || "");
      setIsCatchUp(data.isCatchUp || false);
    } catch (error) {
      console.error("Error fetching question:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setResult("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setResult("Error loading question: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  return {
    question,
    hint,
    difficulty,
    isCompleted,
    displayDay,
    questionLoading,
    dateLockedUntil,
    result,
    setQuestion,
    setHint,
    setDifficulty,
    setIsCompleted,
    setDisplayDay,
    setDateLockedUntil,
    setResult,
    fetchQuestion,
  };
};
