import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentDay, isDayCompleted } from "../services/firestoreService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function PlayPage() {
  const { user, userProgress, refreshUserProgress } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  useEffect(() => {
    const day = getCurrentDay();
    setCurrentDay(day);
    
    const checkCompletion = async () => {
      if (user) {
        const completed = await isDayCompleted(user.uid, day);
        setIsCompleted(completed);
      }
    };
    
    checkCompletion();
  }, [user]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        const next = Math.max(0, prev - 1);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch("http://localhost:5000/play", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (data.error) {
          setResult(data.error);
          return;
        }
        
        setQuestion(data.question);
        setHint(data.hint);
        setDifficulty(data.difficulty || 1);
        if (typeof data.isCompleted === 'boolean') setIsCompleted(data.isCompleted);
        if (typeof data.attemptsLeft === 'number') setAttemptsLeft(data.attemptsLeft);
        if (typeof data.cooldownSeconds === 'number') setCooldownSeconds(data.cooldownSeconds || 0);
      } catch (error) {
        console.error("Error fetching question:", error);
        setResult("Error loading question");
      }
    };

    fetchQuestion();
  }, [user, currentDay]);

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setResult("Please enter an answer");
      return;
    }

    if (cooldownSeconds > 0) {
      setResult(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }

    if (attemptsLeft !== null && attemptsLeft <= 0) {
      setResult("Attempt limit reached for today");
      return;
    }
    
    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch("http://localhost:5000/play/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ day: currentDay, answer }),
      });
      const status = response.status;
      const data = await response.json();
      setResult(data.result);

      if (status === 429) {
        if (typeof data.cooldownSeconds === 'number') setCooldownSeconds(data.cooldownSeconds || 0);
        if (typeof data.attemptsLeft === 'number') setAttemptsLeft(data.attemptsLeft);
        return;
      }
      
      if (data.correct) {
        setIsCompleted(true);
        await refreshUserProgress();
      } else {
        if (typeof data.attemptsLeft === 'number') setAttemptsLeft(data.attemptsLeft);
        if (typeof data.cooldownSeconds === 'number') setCooldownSeconds(data.cooldownSeconds || 0);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setResult("Error submitting answer");
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/rules', label: 'Rules' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/play', label: 'Play', active: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar01 navigationLinks={navLinks} />
      
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-foreground">Day {currentDay} of 10</h1>
              <div className="flex space-x-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`w-3 h-3 rounded-full ${
                      i + 1 <= currentDay 
                        ? 'bg-primary' 
                        : i + 1 === currentDay 
                          ? 'bg-primary/60' 
                          : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {typeof attemptsLeft === 'number' && (
                <span className="px-3 py-1 rounded-full text-sm border bg-muted/30">
                  Attempts left: <strong>{attemptsLeft}</strong>
                </span>
              )}
              {cooldownSeconds > 0 && (
                <span className="px-3 py-1 rounded-full text-sm border bg-yellow-50 text-yellow-800">
                  ⏳ Cooldown: {cooldownSeconds}s
                </span>
              )}
              {isCompleted && (
                <span className="px-3 py-1 rounded-full text-sm border bg-green-50 text-green-800">
                  ✅ Completed
                </span>
              )}
            </div>
            
            {isCompleted && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg mt-4">
                ✅ You've completed today's challenge! Check the leaderboard to see your ranking.
              </div>
            )}
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Today's Challenge</h2>
              <span className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                Difficulty: {difficulty}/5
              </span>
            </div>
            
            <p className="text-lg text-foreground mb-4">{question}</p>
            <p className="text-sm text-muted-foreground">💡 Hint: {hint}</p>
          </div>
          
          {!isCompleted ? (
            <div className="space-y-4">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer here..."
                className="text-lg"
                onKeyPress={(e) => e.key === 'Enter' && !loading && cooldownSeconds === 0 && (attemptsLeft ?? 1) > 0 && submitAnswer()}
                disabled={cooldownSeconds > 0 || (attemptsLeft !== null && attemptsLeft <= 0)}
              />
              <Button 
                onClick={submitAnswer}
                disabled={loading || !answer.trim() || cooldownSeconds > 0 || (attemptsLeft !== null && attemptsLeft <= 0)}
                className="w-full py-4 text-lg"
              >
                {loading ? "Submitting..." : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : (attemptsLeft !== null && attemptsLeft <= 0) ? "No attempts left" : "Submit Answer"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-primary mb-2">Challenge Completed!</h3>
              <p className="text-muted-foreground">Come back tomorrow for the next challenge!</p>
            </div>
          )}
          
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.includes('Correct') || result.includes('Success') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="text-lg font-semibold">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayPage;