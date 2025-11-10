import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentDay } from '../services/firestoreService';
import { usePlay } from '../hooks/usePlay';
import QuestionCard from '../components/play/QuestionCard';
import ProgressGrid from '../components/play/ProgressGrid';
import { Input } from '@/components/ui/input';
import { motion} from "framer-motion";
import DayProgress from '@/components/play/DayProgress';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import tutor1 from '@/assets/tutor1.jpeg';
import tutor2 from '@/assets/tutor2.jpeg';
import { AnimatePresence } from 'framer-motion';

function PlayPage() {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
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

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setMessage('Please enter an answer');
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await submitAnswer(answer.trim());
      if (!res.ok) {
        setMessage(res.message || (res.data && res.data.result) || 'Submission failed');
      } else {
        setMessage(res.data?.result || 'Submitted');
        setAnswer('');
      }
    } finally {
      setSubmitting(false);
    }
  };
  const [isOpen, setIsOpen] = useState(false);


  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-transparent pt-14">
      <div className="container mx-auto px-4 md:px-6 py-8 font-orbitron">

        <div className="space-y-6">
          <DayProgress day={displayDay} totalDays={10} />
          {/* <QuestionCard
            questionImage={question?.image}
            questionText={question?.question}
            hint={question?.hint}
            difficulty={question?.difficulty}
            loading={loading}
            isCompleted={!!question?.isCompleted}
            cooldownSeconds={cooldownSeconds}
            onSubmit={(ans) => submitAnswer(ans)}
          /> */}
          <div className='flex md:flex-row flex-col gap-4 w-full h-[520px] items-center justify-center'>
            <div className='w-[260px] h-[260px] md:h-full md:w-[520px] bg-black'>
              <img
                src={question?.image}
                alt='question'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='flex flex-col w-[500px] h-4xl justify-center items-center'>
              <div className='md:text-3xl text-xl'>Answer :</div>
              {!!question?.isCompleted ? (
                <div className="text-center py-6">
                  <div className="text-4xl">🎉</div>
                  <div className="mt-2">You've completed this question.</div>
                </div>
              ) : (
                <div className='p-1 md:p-0'>
                  <Input
                    id="answer-input"
                    placeholder="Enter answer"
                    value={answer}
                    onChange={(e: any) => setAnswer(e.target.value)}
                    disabled={cooldownSeconds > 0 || submitting}
                    onKeyDown={(e: any) => e.key === 'Enter' && handleSubmit()}
                  />
                  <div className="mt-3 flex gap-2">
                    <Button onClick={handleSubmit} disabled={submitting || cooldownSeconds > 0} className="flex-1">
                      {submitting ? 'Submitting...' : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : 'Submit'}
                    </Button>
                  </div>
                  {message && <div className="mt-3 text-sm text-muted-foreground">{message}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Popup */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
                  initial={{ scale: 0.8, opacity: 0, y: -50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Two images in one row */}
                  <div className="flex gap-4 justify-center">
                    <img
                      src={tutor1}
                      alt="Dummy"
                      className="w-[128px] h-[128px] md:w-[156px] md:h-[156px] object-cover rounded-lg"
                    />
                    <img
                      src={tutor2}
                      alt="Dummy1"
                      className="w-[128px] h-[128px] md:w-[156px] md:h-[156px] object-cover rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-4 text-center text-gray-700">
                    <p>
                      France gifted the Statue of Liberty to the USA. <br />
                      It was made of copper and over time it turned green due to chemical reactions.
                    </p>
                    <p className="mt-3 font-semibold text-gray-900">
                      Answer: Statue of Liberty
                    </p>
                  </div>

                  {/* Close button */}
                  <div className="mt-5 flex justify-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>


          
          {progress && (
            <ProgressGrid
              days={progress.progress as any}
              displayDay={displayDay}
              onSelectDay={(d) => handleSelectDay(d)}
              maxAccessibleDay={Math.min(getCurrentDay(), progress.totalDays || getCurrentDay())}
            />
          )}
          <div className='relative w-full h-[50px] '>
            <button
              onClick={() => setIsOpen(true)}
              className="absolute right-0 px-5 py-3 text-white font-semibold rounded-full border border-[1px] border-white shadow-md hover:bg-blue-700 transition"
            >
              ?
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default PlayPage;
