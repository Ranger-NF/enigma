import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentDay } from '../services/firestoreService';
import { usePlay } from '../hooks/usePlay';
import ProgressGrid from '../components/play/ProgressGrid';
import { Input } from '@/components/ui/input';
import DayProgress from '@/components/play/DayProgress';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from "framer-motion";

import tutor1 from '@/assets/tutor1.jpeg';
import tutor2 from '@/assets/tutor2.jpeg';
import QuestionImage from '@/components/ui/questionImage';

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

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [question?.image]);

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
  const [showFinalCongrats, setShowFinalCongrats] = useState(false);
  useEffect(() => {
    if (question?.isCompleted && displayDay === progress?.progress.length) {
      setShowFinalCongrats(true);
    }
  }, [question, displayDay, progress]);




  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-transparent pt-14">
      <div className="container mx-auto px-4 md:px-6 pt-20 font-orbitron">

        <div className="space-y-6">
          <DayProgress day={displayDay} totalDays={progress?.progress.length} setIsOpen={setIsOpen} />
          <div className='flex flex-col lg:flex-row lg:items-start lg:justify-center gap-8 w-full flex-grow min-h-0'>

            <div className='flex flex-col lg:flex-row gap-6 lg:w-[70%] items-center justify-between flex-shrink-0 mx-auto'>
              {/*Image area*/}
              <div className="relative w-[250px] h-[250px] md:w-[380px] md:h-[380px]
                              bg-black rounded-lg flex items-center justify-center overflow-hidden shrink-0">

                {/* Spinner while image loads */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Spinner / Placeholder */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black rounded-lg">
                      {question?.image ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          <p className="text-gray-300 mt-2">Loading image...</p>
                        </>
                      ) : (
                        <p className="text-gray-400">No image available for this question</p>
                      )}
                    </div>
                  )}

                  {/* Actual Image */}
                  <QuestionImage
                    src={question?.image}
                    imageLoaded={imageLoaded}
                    setImageLoaded={setImageLoaded}
                  />
                </div>
              </div>

              {/*Answer Area*/}
              <div className='flex flex-col lg:w-[50%] max-w-[500px] justify-center items-center text-center lg:text-left'>
                {question?.isCompleted ? (
                  <div >
                    <div>{question?.question}</div>
                    <div className='text-center py-6'>
                      <div className="text-4xl">🎉</div>
                      <div className="mt-2">You've completed this question.</div>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col gap-12 p-1 md:p-0'>
                    <div>{question?.question}</div>
                    <div className='flex flex-col gap-2 '>

                      <div className='md:text-3xl text-xl'>Answer :</div>
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
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-[30%] w-full flex flex-col min-h-0">
              <ProgressGrid
                days={progress?.progress as any}
                displayDay={displayDay}
                onSelectDay={(d) => handleSelectDay(d)}
                maxAccessibleDay={Math.min(getCurrentDay(), progress?.totalDays || getCurrentDay())}
              />
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
                  className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 font-sans"
                  initial={{ scale: 0.8, opacity: 0, y: -50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Tutorial heading with underline */}
                  <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4 pb-3 border-b border-gray-200 tracking-tight">Tutorial</h2>

                  {/* Two images in one row */}
                  <div className="flex gap-4 justify-center mt-4">
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
                  <div className="mt-6 text-center">
                    <p className="text-gray-700 leading-relaxed">
                      France gifted the Statue of Liberty to the USA. <br />
                      It was made of copper and over time it turned green due to chemical reactions.
                    </p>
                    <p className="mt-4 font-medium text-gray-900 text-lg">
                      Answer: <span className="font-semibold">Statue of Liberty</span>
                    </p>
                  </div>

                  {/* Close button */}
                  <div className="mt-5 flex justify-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm tracking-wide"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
  {showFinalCongrats && (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rounded-2xl p-6 max-w-md w-full mx-4 text-center 
                   bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-4 tracking-wide">
          🎉 Congratulations! 🎉
        </h2>

        <p className="text-gray-200 leading-relaxed">
          You’ve completed all available challenges!<br />
          Absolute legend energy.
        </p>

        <div className="mt-6">
          <button
            onClick={() => setShowFinalCongrats(false)}
            className="px-6 py-2.5 rounded-lg bg-white/20 text-white 
                       hover:bg-white/30 transition-colors border border-white/30"
          >
            Awesome!
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>



      </div>
    </motion.div>
  );
}

export default PlayPage;
