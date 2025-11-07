import { useEffect, useRef, useState } from 'react';
import { getCurrentDay } from "../services/firestoreService";

// Lightweight types for hook responses. Kept local to avoid touching global types.
interface QuestionResponse {
  id: string;
  day: number;
  question?: string;
  hint?: string;
  difficulty?: number;
  attemptsBeforeCooldown?: number;
  attemptsInPeriod?: number;
  isCompleted?: boolean;
  cooldownSeconds?: number;
  isUnlocked?: boolean;
  isCatchUp?: boolean;
  dateLockedUntil?: string | null;
  lockReason?: string;
}

interface ProgressResponse {
  currentDay: number;
  progress: Array<{
    day: number;
    isCompleted: boolean;
    isAccessible: boolean;
    reason?: string;
    isDateUnlocked?: boolean;
  }>;
  totalCompleted: number;
  totalDays: number;
}

/**
 * usePlay - encapsulates Play page logic so the page component stays small.
 * - fetches progress & question
 * - prevents requesting future days (client-side guard)
 * - local cooldown enforcement: 30s after 10 attempts (server may override)
 */
export function usePlay(user: any) {
  const BACKEND = import.meta.env.VITE_BACKEND_SERVER_URL || 'http://localhost:5000';

  const [displayDay, setDisplayDay] = useState<number>(1);
  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [questionLoading, setQuestionLoading] = useState<boolean>(false);
  const [attemptsInPeriod, setAttemptsInPeriod] = useState<number>(0);
  const [attemptsBeforeCooldown, setAttemptsBeforeCooldown] = useState<number>(10);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  const COOLDOWN_THRESHOLD = 10; // attempts
  const COOLDOWN_TIME = 30; // seconds
  const cooldownRef = useRef<number | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      if (cooldownRef.current) {
        window.clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      return;
    }

    if (!cooldownRef.current) {
      cooldownRef.current = window.setInterval(() => {
        setCooldownSeconds((s) => {
          if (s <= 1) {
            if (cooldownRef.current) {
              window.clearInterval(cooldownRef.current);
              cooldownRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownRef.current) {
        window.clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, [cooldownSeconds]);

  // Fetch progress with a small session cache
  const fetchProgress = async (force = false): Promise<ProgressResponse | null> => {
    if (!user) return null;
    try {
      if (!force) {
        const cached = sessionStorage.getItem('userProgress');
        const ts = sessionStorage.getItem('userProgressTs');
        if (cached && ts && Date.now() - Number(ts) < 2 * 60 * 1000) {
          const parsed = JSON.parse(cached) as ProgressResponse;
          setProgress(parsed);
          return parsed;
        }
      }

      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND}/progress`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        console.error('fetchProgress failed', await res.text());
        return null;
      }
      const data = (await res.json()) as ProgressResponse;
      sessionStorage.setItem('userProgress', JSON.stringify(data));
      sessionStorage.setItem('userProgressTs', Date.now().toString());
      setProgress(data);
      return data;
    } catch (err) {
      console.error('fetchProgress error', err);
      return null;
    }
  };

  // Fetch question for a day, but do not allow asking for a future day.
  const fetchQuestion = async (day?: number) => {
    if (!user) return null;
    setQuestionLoading(true);
    try {
      const currentDay = getCurrentDay();
      const targetDay = typeof day === 'number' ? day : currentDay;
      const allowedDay = Math.min(targetDay, currentDay);

      const token = await user.getIdToken();
      const url = `${BACKEND}/play?day=${allowedDay}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        console.error('fetchQuestion failed', await res.text());
        setQuestion(null);
        return null;
      }
      const data = (await res.json()) as QuestionResponse;
      setQuestion(data);
      setDisplayDay(data.day);
      setAttemptsBeforeCooldown(data.attemptsBeforeCooldown ?? 10);
      setAttemptsInPeriod(data.attemptsInPeriod ?? 0);
      setCooldownSeconds(data.cooldownSeconds ?? 0);
      return data;
    } catch (err) {
      console.error('fetchQuestion error', err);
      setQuestion(null);
      return null;
    } finally {
      setQuestionLoading(false);
    }
  };

  // Submit answer: enforce local cooldown after threshold; server can override with returned values.
  const submitAnswer = async (answer: string) => {
    if (!user) return { ok: false, message: 'Not authenticated' };
    if (cooldownSeconds > 0) return { ok: false, message: `Please wait ${cooldownSeconds}s` };

    const nextAttempts = attemptsInPeriod + 1;
    setAttemptsInPeriod(nextAttempts);

    if (nextAttempts >= COOLDOWN_THRESHOLD) {
      setCooldownSeconds(COOLDOWN_TIME);
      setAttemptsInPeriod(0);
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND}/play/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ day: displayDay, answer }),
      });
      const data = await res.json();

      // prefer server-provided values when present
      if (data.cooldownSeconds) setCooldownSeconds(data.cooldownSeconds);
      if (typeof data.attemptsInPeriod === 'number') setAttemptsInPeriod(data.attemptsInPeriod);
      if (typeof data.attemptsBeforeCooldown === 'number') setAttemptsBeforeCooldown(data.attemptsBeforeCooldown);

      return { ok: res.ok, data };
    } catch (err) {
      console.error('submitAnswer error', err);
      return { ok: false, message: 'Network error' };
    }
  };

  // Initialize: fetch progress and a recommended question in parallel
  const initialize = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const p = await fetchProgress();
      if (p) {
        // find first incomplete accessible day (client-side)
        const currentDay = getCurrentDay();
        const accessibleMax = Math.min(currentDay, p.totalDays || currentDay);
        const firstIncomplete = p.progress.find(d => !d.isCompleted && d.isAccessible && (d.day <= accessibleMax));
        const recommended = firstIncomplete ? firstIncomplete.day : Math.min(accessibleMax, p.totalDays || accessibleMax);
        await fetchQuestion(recommended);
      } else {
        await fetchQuestion();
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    displayDay,
    setDisplayDay,
    question,
    progress,
    loading,
    questionLoading,
    attemptsInPeriod,
    attemptsBeforeCooldown,
    cooldownSeconds,
    fetchProgress,
    fetchQuestion,
    submitAnswer,
    initialize,
  };
}
