import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentDay } from '../services/firestoreService';
import { usePlay } from '../hooks/usePlay';
import QuestionCard from '../components/play/QuestionCard';
import ProgressGrid from '../components/play/ProgressGrid';

/**
 * PlayPage (composed)
 * - keeps UI small and delegates logic to the `usePlay` hook
 * - enforces client-side guard: cannot open a future day (released at 00:00)
 * - optimized with useCallback to prevent unnecessary child re-renders
 */
function PlayPage() {
  const { currentUser } = useAuth();
  const {
    displayDay,
    question,
    progress,
    questionLoading,
    attemptsInPeriod,
    attemptsBeforeCooldown,
    cooldownSeconds,
    initialize,
    fetchQuestion,
    submitAnswer,
  } = usePlay(currentUser);

  useEffect(() => {
    if (currentUser) initialize();
  }, [currentUser, initialize]);

  const handleSelectDay = useCallback(async (day: number) => {
    const currentDay = getCurrentDay();
    if (day > currentDay) return; // do not allow future day selection on the client
    await fetchQuestion(day);
  }, [fetchQuestion]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <h1 className="text-2xl font-bold">Day {displayDay} of 10</h1>
            <div className="text-sm text-muted-foreground mt-2">
              Attempts this period: {attemptsInPeriod} · Attempts allowed: {attemptsBeforeCooldown} · Cooldown: {cooldownSeconds}s
            </div>
          </div>

          <QuestionCard
          questionImage={question?.image}
            questionText={question?.question}
            hint={question?.hint}
            difficulty={question?.difficulty}
            loading={questionLoading}
            isCompleted={!!question?.isCompleted}
            cooldownSeconds={cooldownSeconds}
            onSubmit={(ans) => submitAnswer(ans)}
          />

          {progress && (
            <ProgressGrid
              days={progress.progress as any}
              displayDay={displayDay}
              onSelectDay={(d) => handleSelectDay(d)}
              maxAccessibleDay={Math.min(getCurrentDay(), progress.totalDays || getCurrentDay())}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayPage;
