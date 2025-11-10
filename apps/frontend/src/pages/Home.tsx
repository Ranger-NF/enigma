import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { getCurrentDay } from "../services/firestoreService";
import { useState, useEffect } from "react";
import potactorImage from "../assets/bg-section-2.png";
import Footer from "@/components/ui/footer";
import Rules from "../components/Rules";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, userProgress } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState(0);

  const fetchProgressFromAPI = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_SERVER_URL || "http://localhost:5000"}/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCompletedDays(data.totalCompleted || 0);
      }
    } catch (error) {
      console.error("Error fetching progress from API:", error);
    }
  };

  useEffect(() => {
    const day = getCurrentDay();
    setCurrentDay(day);

    if (user) {
      fetchProgressFromAPI();
    } else if (userProgress?.completed) {
      const completed = Object.values(userProgress.completed).filter(
        (day: any) => day.done
      ).length;
      setCompletedDays(completed);
    }
  }, [user, userProgress]);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-transparent">
      <Navbar01 />

      <div className="container mx-auto py-12">

        {/* ✅ Hero Section (heading moved up + bg more visible + new button style) */}
<section className="relative flex flex-col justify-center items-center text-center min-h-[85vh] mt-20 md:mt-32 z-10">

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            ENIGMA
          </h1>


          {user ? (
            <div className="flex flex-col sm:flex-row gap-5 justify-center">

              <Button
                onClick={() => navigate("/play")}
                className="px-8 py-4 text-lg rounded-full 
                bg-white/15 border border-purple-400/50 backdrop-blur-sm text-white 
                hover:bg-purple-500/25 hover:border-purple-300
                transition-all duration-300 hover:-translate-y-1"
              >
                Start Today's Challenge
              </Button>

              <Button
                onClick={() => navigate("/leaderboard")}
                className="px-8 py-4 text-lg rounded-full 
                bg-white/10 border border-purple-400/40 backdrop-blur-sm text-white 
                hover:bg-purple-400/20 hover:border-purple-300
                transition-all duration-300 hover:-translate-y-1"
                variant="ghost"
              >
                View Leaderboard
              </Button>

            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-5 justify-center">

              <Button
                onClick={() => (window.location.href = "/signin")}
                className="px-8 py-4 text-lg rounded-full 
                bg-white/15 border border-purple-400/50 backdrop-blur-sm text-white 
                hover:bg-purple-500/25 hover:border-purple-300
                transition-all duration-300 hover:-translate-y-1"
              >
                Sign In to Play
              </Button>

              <Button
               onClick={() => navigate("/how-it-works")}
                className="px-8 py-4 text-lg rounded-full 
                bg-white/10 border border-purple-400/40 backdrop-blur-sm text-white 
                hover:bg-purple-400/20 hover:border-purple-300
                transition-all duration-300 hover:-translate-y-1"
                variant="ghost"
              >
                Read Rules
              </Button>

            </div>
          )}
        </section>

        <section className="px-[15px] md:px-0">
          <img
            src={potactorImage}
            alt="Background"
            aria-hidden
            className="absolute md:right-0 right-1/2 -translate-x-1/2 md:h-[800px] h-[300px] opacity-60 pointer-events-none"
          />

          {user && (
            <div className="relative bg-card border z-10 rounded-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Your Progress
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{completedDays}</div>
                  <div className="text-muted-foreground">Days Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">Day {currentDay}</div>
                  <div className="text-muted-foreground">Current Day</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{10 - completedDays}</div>
                  <div className="text-muted-foreground">Days Remaining</div>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-3 mb-4">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedDays / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-center text-muted-foreground">
                {completedDays}/10 challenges completed (
                {Math.round((completedDays / 10) * 100)}%)
              </p>
            </div>
          )}

          <div className="relative z-0 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Daily Challenges</h3>
              <p className="text-muted-foreground">
                One new question unlocks each day for 10 days. Complete them as fast as possible!
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Live Leaderboard</h3>
              <p className="text-muted-foreground">
                Compete with others! The leaderboard resets daily based on completion speed.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your daily progress and see how you rank against other participants.
              </p>
            </div>
          </div>

          <div className="relative bg-card border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-foreground mb-2">Sign In</h3>
                <p className="text-sm text-muted-foreground">Create an account or sign in with Google</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-foreground mb-2">Daily Question</h3>
                <p className="text-sm text-muted-foreground">Solve today's challenge</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-foreground mb-2">Compete</h3>
                <p className="text-sm text-muted-foreground">Climb the leaderboard</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  4
                </div>
                <h3 className="font-semibold text-foreground mb-2">Repeat</h3>
                <p className="text-sm text-muted-foreground">Return tomorrow</p>
              </div>
            </div>
          </div>
        </section>

        <section id="rules" className="px-[15px] md:px-0 h-screen">
          <Rules />
        </section>
      </div>

      <Footer />
    </div>
  );
}
