import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useState, useEffect } from "react";
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
  attemptsLeft: number;
  maxAttempts: number;
  isCompleted?: boolean;
  cooldownSeconds?: number;
  isUnlocked?: boolean;
  lockReason?: string;
  isCatchUp?: boolean;
}

interface ProgressResponse {
  currentDay: number;
  progress: Array<{
    day: number;
    isCompleted: boolean;
    isAccessible: boolean;
    reason: string;
    attemptsUsed: number;
    attemptsLeft: number;
    isCurrentDay: boolean;
  }>;
  totalCompleted: number;
  totalDays: number;
}

function PlayPage() {
  const { user, refreshUserProgress } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(0);
  const [maxAttempts] = useState(10);
  const [cooldownMsg, setCooldownMsg] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [lockReason, setLockReason] = useState("");
  const [isCatchUp, setIsCatchUp] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [userProgress, setUserProgress] = useState<ProgressResponse | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);

  // New state for better UX
  const [displayDay, setDisplayDay] = useState(1); // The day currently being displayed
  const [recommendedDay, setRecommendedDay] = useState<number | null>(null); // Next available question

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const fetchProgress = async (): Promise<ProgressResponse | null> => {
    if (!user) return null;

    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:5000/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ProgressResponse = await response.json();

      if (response.ok) {
        setUserProgress(data);
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
    // Find the first incomplete but accessible question
    const nextIncomplete = progressData.progress.find(day => 
      !day.isCompleted && day.isAccessible
    );
    
    if (nextIncomplete) {
      return nextIncomplete.day;
    }
    
    // If all accessible questions are complete, return current calendar day
    return progressData.currentDay;
  };

  const fetchQuestion = async (day?: number) => {
    if (!user) return;

    setQuestionLoading(true);
    setResult("");
    
    try {
      const token = await user.getIdToken();
      const url = day ? `http://localhost:5000/play?day=${day}` : "http://localhost:5000/play";
      
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

      // Update display day to match the returned question
      setDisplayDay(data.day);
      setCurrentDay(data.day);

      if (data.isUnlocked || data.isCatchUp) {
        setQuestion(data.question || "");
        setHint(data.hint || "");
        setDifficulty(data.difficulty || 1);
      } else {
        setQuestion("");
        setHint("");
        setDifficulty(1);
        setAnswer("");
      }

      // Update all status from backend
      setIsCompleted(data.isCompleted || false);
      setAttemptsLeft(data.attemptsLeft || 0);
      setCooldownSeconds(data.cooldownSeconds || 0);
      setIsUnlocked(data.isUnlocked || false);
      setLockReason(data.lockReason || "");
      setIsCatchUp(data.isCatchUp || false);

    } catch (error) {
      console.error("Error fetching question:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setResult("Cannot connect to server. Please make sure the backend is running on port 5000.");
      } else {
        setResult("Error loading question: " + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } finally {
      setQuestionLoading(false);
    }
  };

  const initializePage = async () => {
    if (!user) return;

    // First fetch progress to understand user's status
    const progressData = await fetchProgress();
    if (!progressData) return;

    // Determine which question to show
    const nextDay = findNextAvailableQuestion(progressData);
    setRecommendedDay(nextDay);

    // Fetch the appropriate question
    await fetchQuestion(nextDay);
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

    if (cooldownSeconds > 0) {
      setResult(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }

    if (attemptsLeft <= 0) {
      setResult("Attempt limit reached for today");
      return;
    }

    setLoading(true);
    setResult("");
    setCooldownMsg("");

    try {
      const token = await user?.getIdToken();
      const response = await fetch("http://localhost:5000/play/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ day: displayDay, answer }),
      });
      
      const data = await response.json();
      setResult(data.result);

      if (response.status === 429) {
        setCooldownSeconds(data.cooldownSeconds || 0);
        setAttemptsLeft(data.attemptsLeft || 0);
        return;
      }

      if (data.correct) {
        setIsCompleted(true);
        setAnswer("");
        await refreshUserProgress();
        
        // Refresh progress and find next question
        const updatedProgress = await fetchProgress();
        if (updatedProgress) {
          const nextDay = findNextAvailableQuestion(updatedProgress);
          setRecommendedDay(nextDay);
        }
      } else {
        setAttemptsLeft(data.attemptsLeft || 0);
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

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/rules", label: "Rules" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/play", label: "Play", active: true },
  ];

  const outOfAttempts = attemptsLeft <= 0;
  const calendarDay = getCurrentDay();
  const hasAvailableQuestions = userProgress?.progress.some(day => 
    !day.isCompleted && day.isAccessible
  ) || false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar01 navigationLinks={navLinks} />

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
                  const dayProgress = userProgress?.progress.find(p => p.day === dayNum);
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
                Attempts left: <strong>{attemptsLeft}</strong>
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
                Your Progress ({userProgress?.totalCompleted || 0}/{userProgress?.totalDays || 10} completed)
              </h3>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> Complete questions in order. Click on any available (blue) question to work on it.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {userProgress?.progress.map((day) => (
                  <div
                    key={day.day}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      day.isCompleted
                        ? "bg-green-50 border-green-200 text-green-800"
                        : day.isAccessible
                          ? "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                          : "bg-gray-50 border-gray-200 text-gray-500"
                    } ${
                      day.day === displayDay ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => day.isAccessible && handleDaySelect(day.day)}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">Day {day.day}</div>
                      <div className="text-xs">
                        {day.isCompleted ? (
                          <span className="text-green-600">Completed</span>
                        ) : day.isAccessible ? (
                          <span className="text-blue-600">
                            {day.day === recommendedDay ? "Recommended" : "Available"}
                          </span>
                        ) : (
                          <span className="text-gray-500">Locked</span>
                        )}
                      </div>
                      {!day.isAccessible && day.reason && (
                        <div className="text-xs text-gray-400 mt-1">{day.reason}</div>
                      )}
                      {day.isAccessible && !day.isCompleted && (
                        <div className="text-xs text-blue-600 mt-1">
                          {day.attemptsLeft} attempts left
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Display */}
          {(isUnlocked || isCatchUp) ? (
            <>
              {/* Question Card */}
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
                        outOfAttempts
                          ? "bg-destructive/20 text-destructive"
                          : attemptsLeft <= 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {outOfAttempts ? "No attempts" : `${attemptsLeft}/${maxAttempts} left`}
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

              {/* Answer Input */}
              {!isCompleted && !questionLoading && (
                <div className="space-y-4">
                  <Input
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      if (result) setResult("");
                    }}
                    placeholder="Enter your answer here..."
                    className="text-lg"
                    onKeyPress={(e) =>
                      e.key === "Enter" && !loading && cooldownSeconds === 0 && attemptsLeft > 0 && submitAnswer()
                    }
                    disabled={cooldownSeconds > 0 || attemptsLeft <= 0}
                  />
                  <Button
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim() || cooldownSeconds > 0 || attemptsLeft <= 0}
                    className="w-full py-4 text-lg"
                  >
                    {loading
                      ? "Submitting..."
                      : cooldownSeconds > 0
                        ? `Wait ${cooldownSeconds}s`
                        : attemptsLeft <= 0
                          ? "No attempts left"
                          : "Submit Answer"}
                  </Button>
                </div>
              )}

              {/* Completion Message */}
              {isCompleted && (
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
                      All available questions completed! Check back tomorrow for new challenges.
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Locked Question Display */
            <div className="bg-card border rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-muted-foreground mb-2">Question Locked</h3>
                <p className="text-muted-foreground mb-4">
                  {lockReason || `Complete Day ${displayDay - 1} to unlock this question`}
                </p>
                
                <div className="bg-muted/30 border rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    You need to complete previous questions in order to unlock this one.
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

          {/* Result Message */}
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