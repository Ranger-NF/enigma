import { useState } from "react";
import { QuestionResponse } from "./useQuestion";

interface SubmitAnswerParams {
  user: any;
  displayDay: number;
  answer: string;
  dateLockedUntil: string | null;
  cooldownSeconds: number;
  setResult: (val: string) => void;
  setIsCompleted: (val: boolean) => void;
  setAnswer: (val: string) => void;
  setCooldownSeconds: (val: number) => void;
  setAttemptsBeforeCooldown: (val: number) => void;
  setAttemptsInPeriod: (val: number) => void;
  refreshUserProgress: () => Promise<void>;
  onSuccess?: () => Promise<void>;
}

/**
 * Custom hook to handle answer submission logic
 */
export const useAnswerSubmission = () => {
  const [loading, setLoading] = useState(false);
  const [, setCooldownMsg] = useState("");

  const submitAnswer = async (params: SubmitAnswerParams) => {
    const {
      user,
      displayDay,
      answer,
      dateLockedUntil,
      cooldownSeconds,
      setResult,
      setIsCompleted,
      setAnswer,
      setCooldownSeconds,
      setAttemptsBeforeCooldown,
      setAttemptsInPeriod,
      refreshUserProgress,
      onSuccess,
    } = params;

    if (!user) {
      setResult("You must be logged in to submit an answer");
      return;
    }

    // Check if question is date-locked
    if (dateLockedUntil) {
      const unlockDate = new Date(dateLockedUntil);
      setResult(`This question unlocks on ${unlockDate.toLocaleString()}`);
      return;
    }

    // Check cooldown
    if (cooldownSeconds > 0) {
      setResult(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }

    setLoading(true);
    setResult("");
    setCooldownMsg("");

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL || "http://localhost:5000"}/play/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ day: displayDay, answer }),
        }
      );

      const data = await response.json();
      setResult(data.result);

      if (response.status === 429) {
        setCooldownSeconds(data.cooldownSeconds || 0);
        setAttemptsBeforeCooldown(data.attemptsBeforeCooldown ?? 10);
        setAttemptsInPeriod(data.attemptsInPeriod ?? 0);
        return;
      }

      if (data.correct) {
        setIsCompleted(true);
        setAnswer("");
        await refreshUserProgress();

        if (onSuccess) {
          await onSuccess();
        }
      } else {
        setAttemptsBeforeCooldown(data.attemptsBeforeCooldown ?? 10);
        setAttemptsInPeriod(data.attemptsInPeriod ?? 0);
        setCooldownSeconds(data.cooldownSeconds || 0);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setResult("Error submitting answer");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitAnswer,
  };
};
