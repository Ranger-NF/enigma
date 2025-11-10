import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentDay } from '../services/firestoreService';
import { usePlay } from '../hooks/usePlay';
import QuestionCard from '../components/play/QuestionCard';
import ProgressGrid from '../components/play/ProgressGrid';
import { motion } from 'framer-motion';

function PlayPage() {
  const { currentUser } = useAuth();
  const {
    displayDay,
    question,
    progress,
    loading,
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
    if (day > currentDay) return;
    await fetchQuestion(day);
  }, [fetchQuestion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    className="min-h-screen bg-transparent pt-10">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">

        <div className="space-y-6">

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 shadow-md">
            <h1 className="text-2xl font-bold text-white">Day {displayDay} of 10</h1>
            <div className="text-sm text-gray-300 mt-2">
              Attempts this period: {attemptsInPeriod} · Attempts allowed: {attemptsBeforeCooldown} · Cooldown: {cooldownSeconds}s
            </div>
          </div>

          <QuestionCard
          questionImage={question?.image}
            questionText={question?.question}
            hint={question?.hint}
            difficulty={question?.difficulty}
            loading={loading}
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
    </motion.div>
  );
}

export default PlayPage;
