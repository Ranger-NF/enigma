import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentDay } from "../services/firestoreService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuestionResponse {
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
  dateLockedUntil?: string; // ISO string of unlock date
}

interface ProgressResponse {
  currentDay: number;
  progress: Array<{
    day: number;
    isCompleted: boolean;
    isAccessible: boolean;
    reason: string;
    isCurrentDay: boolean;
    isDateUnlocked: boolean;
  }>;
  totalCompleted: number;
  totalDays: number;
  nextAvailableDay?: number | null;
  allQuestionsComplete?: boolean;
  hasIncompleteAccessible?: boolean;
}

function PlayPage() {
  const { user, refreshUserProgress } = useAuth();
  const [, setCurrentDay] = useState(1);
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [attemptsBeforeCooldown, setAttemptsBeforeCooldown] = useState<number>(10);
  const [attemptsInPeriod, setAttemptsInPeriod] = useState<number>(0);
  const [, setCooldownMsg] = useState("");

  // New state for enhanced navigation and unlock date handling
  const [displayDay, setDisplayDay] = useState(1);
  const [recommendedDay, setRecommendedDay] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [lockReason, setLockReason] = useState("");
  const [isCatchUp, setIsCatchUp] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [userProgressData, setUserProgressData] = useState<ProgressResponse | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [dateLockedUntil, setDateLockedUntil] = useState<string | null>(null);

  // Cooldown countdown timer with auto-refresh
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

      // Cooldown just expired, fetch fresh data from server
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

  const fetchProgress = async (): Promise<ProgressResponse | null> => {
    if (!user) return null;

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL || "http://localhost:5000"}/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data: ProgressResponse = await response.json();

      if (response.ok) {
        setUserProgressData(data);
        return data;
      } else {
        console.error("Failed to fetch progress:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
      return null;
    }
  };

  const findNextAvailableQuestion = (progressData: ProgressResponse): number => {
    // First, try to find an incomplete and accessible day (unlocked by serial progression)
    const nextIncomplete = progressData.progress.find(day =>
      !day.isCompleted && day.isAccessible && day.isDateUnlocked
    );

    if (nextIncomplete) {
      return nextIncomplete.day;
    }

    // If no accessible days, find the first incomplete day
    // This ensures new users start at Day 1, not Day 10
    const firstIncomplete = progressData.progress.find(day => !day.isCompleted);

    if (firstIncomplete) {
      return firstIncomplete.day;
    }

    // If everything is completed, return Day 1 (to show completion state)
    return 1;
  };

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
      setCurrentDay(data.day);

      // Handle unlock date logic
      if (data.dateLockedUntil) {
        setDateLockedUntil(data.dateLockedUntil);
        setIsUnlocked(false);
        setLockReason(data.lockReason || "This question is not yet available");
        setQuestion("");
        setHint("");
        setDifficulty(1);
        setAnswer("");
      } else if (data.isUnlocked || data.isCatchUp) {
        setQuestion(data.question || "");
        setHint(data.hint || "");
        setDifficulty(data.difficulty || 1);
        setDateLockedUntil(null);
      } else {
        setQuestion("");
        setHint("");
        setDifficulty(1);
        setAnswer("");
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
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setResult("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setResult("Error loading question: " + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  const initializePage = async () => {
    if (!user) return;

    // OPTIMIZATION: Fetch both in parallel instead of sequentially
    const [progressData] = await Promise.all([
      fetchProgress(),
      fetchQuestion() // Fetch current day question immediately
    ]);

    if (progressData) {
      const nextDay = findNextAvailableQuestion(progressData);
      setRecommendedDay(nextDay);

      // Only fetch again if nextDay is different from current day
      if (nextDay !== displayDay) {
        await fetchQuestion(nextDay);
      }
    }
  };

  useEffect(() => {
    if (user) {
      initializePage();
    }
  }, [user]);

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setResult("Please enter an answer");
      return;
    }

    if (!isUnlocked && !isCatchUp) {
      setResult(lockReason || "This question is locked");
      return;
    }

    if (dateLockedUntil) {
      const unlockDate = new Date(dateLockedUntil);
      setResult(`This question unlocks on ${unlockDate.toLocaleString()}`);
      return;
    }

    if (cooldownSeconds > 0) {
      setResult(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }

    setLoading(true);
    setResult("");
    setCooldownMsg("");

    try {
      const token = await user?.getIdToken();
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

        const updatedProgress = await fetchProgress();
        if (updatedProgress) {
          const nextDay = findNextAvailableQuestion(updatedProgress);
          setRecommendedDay(nextDay);
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

  const handleDaySelect = async (day: number) => {
    setResult("");
    await fetchQuestion(day);
    setShowProgress(false);
  };

  const handleNextQuestion = async () => {
    if (recommendedDay && recommendedDay !== displayDay) {
      await fetchQuestion(recommendedDay);
    } else {
      setShowProgress(true);
      await fetchProgress();
    }
  };

  const goToRecommendedQuestion = async () => {
    if (recommendedDay) {
      await fetchQuestion(recommendedDay);
    }
  };


  // Users never run out of attempts, only cooldowns apply
  const calendarDay = getCurrentDay();
  const hasAvailableQuestions = userProgressData?.progress.some(day => 
    !day.isCompleted && day.isAccessible
  ) || false;

  const isDateLocked = dateLockedUntil && new Date() < new Date(dateLockedUntil);

  return (
    <div className="min-h-screen bg-background">
      <Navbar01 />

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header with day indicator and progress dots */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Day {displayDay} of 10
                </h1>
                {recommendedDay && recommendedDay !== displayDay && (
                  <p className="text-sm text-muted-foreground">
                    Recommended: Day {recommendedDay}
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={goToRecommendedQuestion}
                      className="ml-2 h-auto p-0 text-blue-600"
                    >
                      Go there →
                    </Button>
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: 10 }, (_, i) => {
                  const dayNum = i + 1;
                  const dayProgress = userProgressData?.progress.find(p => p.day === dayNum);
                  return (
                    <div
                      key={dayNum}
                      className={`w-3 h-3 rounded-full ${
                        dayProgress?.isCompleted
                          ? "bg-green-500"
                          : dayNum === displayDay
                            ? "bg-primary"
                            : dayNum <= calendarDay
                              ? "bg-primary/40"
                              : "bg-muted"
                      }`}
                      title={`Day ${dayNum}${dayProgress?.isCompleted ? ' (completed)' : ''}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm border bg-muted/30">
                Attempts before cooldown: <strong>{attemptsBeforeCooldown}</strong>
              </span>
              {cooldownSeconds > 0 && (
                <span className="px-3 py-1 rounded-full text-sm border bg-yellow-50 text-yellow-800">
                  Cooldown: {cooldownSeconds}s
                </span>
              )}
              {isCompleted && (
                <span className="px-3 py-1 rounded-full text-sm border bg-green-50 text-green-800">
                  Completed
                </span>
              )}
              {isCatchUp && (
                <span className="px-3 py-1 rounded-full text-sm border bg-blue-50 text-blue-800">
                  Catch-up Mode
                </span>
              )}
              {isDateLocked && (
                <span className="px-3 py-1 rounded-full text-sm border bg-orange-50 text-orange-800">
                  Date Locked
                </span>
              )}
            </div>

            {/* Quick navigation */}
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowProgress(!showProgress);
                  if (!showProgress) fetchProgress();
                }}
              >
                {showProgress ? "Hide Progress" : "Show All Days"}
              </Button>
              
              {recommendedDay && recommendedDay !== displayDay && (
                <Button
                  size="sm"
                  onClick={goToRecommendedQuestion}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Go to Day {recommendedDay}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Display */}
          {showProgress && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Your Progress ({userProgressData?.totalCompleted || 0}/{userProgressData?.totalDays || 10} completed)
              </h3>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> Questions unlock by date and must be completed in order. Click on available (blue) questions to work on them.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {userProgressData?.progress.map((day) => (
                  <div
                    key={day.day}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      day.isCompleted
                        ? "bg-green-50 border-green-200 text-green-800"
                        : day.isAccessible && day.isDateUnlocked
                          ? "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                          : !day.isDateUnlocked
                            ? "bg-orange-50 border-orange-200 text-orange-500"
                            : "bg-gray-50 border-gray-200 text-gray-500"
                    } ${
                      day.day === displayDay ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => day.isAccessible && day.isDateUnlocked && handleDaySelect(day.day)}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">Day {day.day}</div>
                      <div className="text-xs">
                        {day.isCompleted ? (
                          <span className="text-green-600">Completed</span>
                        ) : !day.isDateUnlocked ? (
                          <span className="text-orange-600">Date Locked</span>
                        ) : day.isAccessible ? (
                          <span className="text-blue-600">
                            {day.day === recommendedDay ? "Recommended" : "Available"}
                          </span>
                        ) : (
                          <span className="text-gray-500">Locked</span>
                        )}
                      </div>
                      {day.reason && (
                        <div className="text-xs text-gray-400 mt-1">{day.reason}</div>
                      )}
                      {day.isAccessible && !day.isCompleted && day.isDateUnlocked && (
                        <div className="text-xs text-blue-600 mt-1">
                          Available
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Locked Display */}
          {isDateLocked && (
            <div className="bg-card border rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-2xl font-bold text-orange-600 mb-2">Question Not Yet Available</h3>
                <p className="text-muted-foreground mb-4">
                  This question will unlock on {new Date(dateLockedUntil!).toLocaleString()}
                </p>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-orange-800">
                    Questions are released on a schedule. Please check back later!
                  </p>
                </div>
                
                <div className="flex gap-3 justify-center">
                  {recommendedDay && (
                    <Button
                      onClick={() => fetchQuestion(recommendedDay)}
                      className="bg-primary text-primary-foreground"
                    >
                      Go to Day {recommendedDay}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProgress(true);
                      fetchProgress();
                    }}
                  >
                    Show All Days
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Question Display */}
          {(isUnlocked || isCatchUp) && !isDateLocked && (
            <>
              <div className="bg-card border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Day {displayDay} Challenge
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                      Difficulty: {difficulty}/5
                    </span>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        attemptsBeforeCooldown <= 3
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {attemptsBeforeCooldown} attempts until cooldown
                    </span>
                  </div>
                </div>

                {questionLoading ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">Loading...</div>
                    <p className="text-muted-foreground">Loading question...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-lg text-foreground mb-4">{question}</p>
                    <p className="text-sm text-muted-foreground">Hint: {hint}</p>
                  </>
                )}
              </div>

              {!isCompleted && !questionLoading ? (
                <div className="space-y-4">
                  <Input
                    id="answer-input"
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      if (result) setResult("");
                    }}
                    placeholder="Enter your answer here..."
                    className="text-lg"
                    onKeyPress={(e) =>
                      e.key === "Enter" && !loading && cooldownSeconds === 0 && submitAnswer()
                    }
                    disabled={cooldownSeconds > 0}
                  />
                  <Button
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim() || cooldownSeconds > 0}
                    className="w-full py-4 text-lg"
                  >
                    {loading
                      ? "Submitting..."
                      : cooldownSeconds > 0
                        ? `Wait ${cooldownSeconds}s`
                        : "Submit Answer"}
                  </Button>
                </div>
              ) : isCompleted ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-primary mb-2">Challenge Completed!</h3>
                  <p className="text-muted-foreground mb-6">You've completed Day {displayDay}.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {recommendedDay && recommendedDay !== displayDay ? (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-green-600 text-white hover:bg-green-700 px-6 py-3"
                      >
                        Next Question (Day {recommendedDay})
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setShowProgress(true);
                          fetchProgress();
                        }}
                        className="bg-green-600 text-white hover:bg-green-700 px-6 py-3"
                      >
                        View All Progress
                      </Button>
                    )}
                  </div>
                  
                  {!hasAvailableQuestions && (
                    <p className="text-sm text-muted-foreground mt-4">
                      All available questions completed! Check back when more unlock.
                    </p>
                  )}
                </div>
              ) : null}
            </>
          )}

          {/* Progression Locked Display */}
          {!isUnlocked && !isCatchUp && !isDateLocked && (
            <div className="bg-card border rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-muted-foreground mb-2">Question Locked</h3>
                <p className="text-muted-foreground mb-4">
                  {lockReason || `Complete Day ${displayDay - 1} to unlock this question`}
                </p>
                
                <div className="bg-muted/30 border rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Complete previous questions in order to unlock this one.
                  </p>
                </div>
                
                <div className="flex gap-3 justify-center">
                  {recommendedDay && (
                    <Button
                      onClick={() => fetchQuestion(recommendedDay)}
                      className="bg-primary text-primary-foreground"
                    >
                      Go to Day {recommendedDay}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProgress(true);
                      fetchProgress();
                    }}
                  >
                    Show All Days
                  </Button>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.toLowerCase().includes("success") || result.toLowerCase().includes("correct")
                  ? "bg-green-50 border-green-200 text-green-800"
                  : result.toLowerCase().includes("attempt") || result.toLowerCase().includes("remaining")
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                    : result.toLowerCase().includes("wait") || result.toLowerCase().includes("cooldown")
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <p className="text-lg font-semibold">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayPage;