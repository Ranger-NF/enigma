import { useState, useEffect, useRef } from "react";

interface QuestionResponse {
  attemptsBeforeCooldown: number;
  attemptsInPeriod: number;
  cooldownSeconds: number;
}

/**
 * Custom hook to manage cooldown timer and auto-refresh when cooldown expires
 */
export const useCooldown = (
  user: any,
  displayDay: number,
  initialCooldown: number,
  initialAttemptsInPeriod: number
) => {
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(initialCooldown);
  const [attemptsBeforeCooldown, setAttemptsBeforeCooldown] = useState<number>(10);
  const [attemptsInPeriod, setAttemptsInPeriod] = useState<number>(initialAttemptsInPeriod);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        const newValue = Math.max(0, prev - 1);
        return newValue;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Auto-refresh when cooldown expires
  // Use a ref to track if we've already refreshed to prevent duplicate calls
  const hasRefreshedRef = useRef(false);

  useEffect(() => {
    // Only refresh when cooldown hits exactly 0 (not on every countdown tick)
    if (cooldownSeconds === 0 && attemptsInPeriod >= 10 && !hasRefreshedRef.current) {
      hasRefreshedRef.current = true;

      const refreshData = async () => {
        if (!user) return;

        try {
          const token = await user.getIdToken();
          const url = `${import.meta.env.VITE_BACKEND_SERVER_URL || "http://localhost:5000"}/play?day=${displayDay}`;
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data: QuestionResponse = await response.json();
            setAttemptsBeforeCooldown(data.attemptsBeforeCooldown ?? 10);
            setAttemptsInPeriod(data.attemptsInPeriod ?? 0);
            setCooldownSeconds(data.cooldownSeconds || 0);
          }
        } catch (error) {
          console.error("Error refreshing after cooldown:", error);
        }
      };

      refreshData();
    }

    // Reset the ref when cooldown starts again
    if (cooldownSeconds > 0) {
      hasRefreshedRef.current = false;
    }
  }, [cooldownSeconds, attemptsInPeriod, user, displayDay]);

  return {
    cooldownSeconds,
    setCooldownSeconds,
    attemptsBeforeCooldown,
    setAttemptsBeforeCooldown,
    attemptsInPeriod,
    setAttemptsInPeriod,
  };
};
