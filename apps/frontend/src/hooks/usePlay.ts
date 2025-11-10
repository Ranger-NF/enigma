import { useEffect, useRef, useState, useCallback } from 'react';
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
  image?: string;
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
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Fetch progress with a small session cache and request deduplication
  const fetchProgress = useCallback(async (force = false): Promise<ProgressResponse | null> => {
    if (!user) return null;
    try {
      if (!force) {
        const cached = sessionStorage.getItem('userProgress');
        const ts = sessionStorage.getItem('userProgressTs');
        if (cached && ts && Date.now() - Number(ts) < 2 * 60 * 1000) {
          const parsed = JSON.parse(cached) as ProgressResponse;
          console.log('📦 Using cached progress');
          setProgress(parsed);
          return parsed;
        }
      }

      console.log('🔄 Fetching progress from:', `${BACKEND}/progress`);
      const token = await user.getIdToken();
      const res = await fetch(`${BACKEND}/progress`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        console.error('❌ fetchProgress failed - Status:', res.status);
        console.error('❌ Response:', await res.text());
        return null;
      }
      const data = (await res.json()) as ProgressResponse;
      console.log('✅ Progress fetched:', data);
      sessionStorage.setItem('userProgress', JSON.stringify(data));
      sessionStorage.setItem('userProgressTs', Date.now().toString());
      setProgress(data);
      return data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('fetchProgress error', err);
      }
      return null;
    }
  }, [user, BACKEND]);

  // Fetch question for a day with caching and request deduplication
  const fetchQuestion = useCallback(async (day?: number) => {
    if (!user) return null;

    const currentDay = getCurrentDay();
    const targetDay = typeof day === 'number' ? day : currentDay;
    const allowedDay = Math.min(targetDay, currentDay);

    // Check cache first (30 seconds cache) BEFORE creating AbortController
    const cacheKey = `question_${allowedDay}`;
    const cached = sessionStorage.getItem(cacheKey);
    const ts = sessionStorage.getItem(`${cacheKey}_ts`);
    if (cached && ts && Date.now() - Number(ts) < 30 * 1000) {
      const data = JSON.parse(cached) as QuestionResponse;
      setQuestion(data);
      setDisplayDay(data.day);
      setAttemptsBeforeCooldown(data.attemptsBeforeCooldown ?? 10);
      setAttemptsInPeriod(data.attemptsInPeriod ?? 0);
      setCooldownSeconds(data.cooldownSeconds ?? 0);
      return data;
    }

    // Only create AbortController if we're actually going to fetch
    setQuestionLoading(true);

    // Abort any pending request and create a new controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a local AbortController for this specific request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = await user.getIdToken();
      const url = `${BACKEND}/play?day=${allowedDay}`;
      
      console.log('🔄 Fetching question from:', url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ fetchQuestion failed - Status:', res.status);
        console.error('❌ Response:', errorText);
        setQuestion(null);
        return null;
      }
      const data = (await res.json()) as QuestionResponse;
      
      console.log('✅ Question fetched successfully:', data);

      // Cache the question
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      sessionStorage.setItem(`${cacheKey}_ts`, Date.now().toString());

      setQuestion(data);
      setDisplayDay(data.day);
      setAttemptsBeforeCooldown(data.attemptsBeforeCooldown ?? 10);
      setAttemptsInPeriod(data.attemptsInPeriod ?? 0);
      setCooldownSeconds(data.cooldownSeconds ?? 0);
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was aborted, ignore
        return null;
      }
      if (import.meta.env.DEV) {
        console.error('fetchQuestion error', err);
      }
      setQuestion(null);
      return null;
    } finally {
      setQuestionLoading(false);
      // Don't set ref to null - leave it for cleanup on unmount
      // This prevents race conditions with concurrent calls
    }
  }, [user, BACKEND]);

  // Submit answer with cooldown enforcement
  const submitAnswer = useCallback(async (answer: string) => {
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

      // Invalidate question cache on submission
      sessionStorage.removeItem(`question_${displayDay}`);

      // If answer is correct, refresh progress and navigate to next question
      if (res.ok && data.correct) {
        // Invalidate progress cache to get fresh unlocked state
        sessionStorage.removeItem('userProgress');
        sessionStorage.removeItem('userProgressTs');

        // Force refresh progress to see newly unlocked questions
        const updatedProgress = await fetchProgress(true);

        // Auto-navigate to next question if it exists and is unlocked
        if (updatedProgress) {
          const currentDay = getCurrentDay();
          const nextDay = displayDay + 1;
          const maxDay = Math.min(currentDay, updatedProgress.totalDays || currentDay);

          if (nextDay <= maxDay) {
            const nextDayProgress = updatedProgress.progress.find(d => d.day === nextDay);
            if (nextDayProgress && nextDayProgress.isAccessible && !nextDayProgress.isCompleted) {
              // Invalidate next question's cache to ensure fresh data
              sessionStorage.removeItem(`question_${nextDay}`);
              // Navigate to next question
              await fetchQuestion(nextDay);
            }
          }
        }
      }

      return { ok: res.ok, data };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('submitAnswer error', err);
      }
      return { ok: false, message: 'Network error' };
    }
  }, [user, displayDay, attemptsInPeriod, cooldownSeconds, COOLDOWN_THRESHOLD, COOLDOWN_TIME, BACKEND, fetchProgress, fetchQuestion]);

  // Initialize: fetch progress and a recommended question
  const initialize = useCallback(async () => {
    if (!user) {
      console.log('❌ No user found, skipping initialization');
      return;
    }
    console.log('🚀 Initializing usePlay hook...');
    setLoading(true);
    try {
      const p = await fetchProgress();
      if (p) {
        console.log('📊 User has progress, fetching first incomplete question');
        // find first incomplete accessible day (client-side)
        const currentDay = getCurrentDay();
        const accessibleMax = Math.min(currentDay, p.totalDays || currentDay);
        const firstIncomplete = p.progress.find(d => !d.isCompleted && d.isAccessible && (d.day <= accessibleMax));
        const recommended = firstIncomplete ? firstIncomplete.day : Math.min(accessibleMax, p.totalDays || accessibleMax);
        console.log('📍 Recommended day:', recommended);
        await fetchQuestion(recommended);
      } else {
        await fetchQuestion();
      }
    } finally {
      setLoading(false);
    }
  }, [user, fetchProgress, fetchQuestion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (cooldownRef.current) {
        window.clearInterval(cooldownRef.current);
      }
    };
  }, []);

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
