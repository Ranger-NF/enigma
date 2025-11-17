import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentDay, getEnhancedDailyLeaderboard } from "../services/firestoreService";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  completedAt: any;
  attempts: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const day = await getCurrentDay();
      setCurrentDay(day);
      setSelectedDay(day);
      fetchLeaderboard(day);
    };

    load();
  }, []);

  const fetchLeaderboard = async (day: number) => {
    setLoading(true);
    try {
      // Use enhanced leaderboard with attempts tracking
      const data = await getEnhancedDailyLeaderboard(day, 20);
      setLeaderboard(data);

      if (currentUser) {
        const userEntry = data.find(entry => entry.id === currentUser.uid);
        setUserRank(userEntry ? userEntry.rank : null);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    setLeaderboard([]);
    fetchLeaderboard(day);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  // Get the date for each day (Nov 17-22, 2025)
  const getDayDate = (day: number): string => {
    const dates = ["Nov 17", "Nov 18", "Nov 19", "Nov 20", "Nov 21", "Nov 22"];
    return dates[day - 1] || "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-transparent pt-14"
    >
      <div className="container mx-auto px-4 md:px-6 pt-20 font-orbitron">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Daily Leaderboard
          </h1>
          <p className="text-gray-300 text-lg">
            See who completed today's challenge the fastest!
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Challenge runs from November 17-22, 2025
          </p>
        </div>

        <div className="space-y-6">
          {/* Day Selector */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Select Day
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, i) => {
                const day = i + 1;
                const isSelected = day === selectedDay;

                return (
                  <Button
                    key={day}
                    onClick={() => handleDayChange(day)}
                    variant={isSelected ? "default" : "outline"}
                    disabled={day > currentDay}
                    className={`transition-all ${
                      isSelected 
                        ? "bg-white text-black hover:bg-gray-200" 
                        : day > currentDay
                        ? "opacity-40 cursor-not-allowed"
                        : "bg-transparent border-white/30 text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>Day {day}</span>
                      <span className="text-xs opacity-70">
                        {getDayDate(day)}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* User Rank */}
          {currentUser && userRank && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 text-white px-6 py-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Your Ranking</h3>
                  <p className="text-sm text-gray-300">
                    You are ranked #{userRank} for Day {selectedDay} ({getDayDate(selectedDay)})
                  </p>
                </div>
                <div className="text-3xl">{getRankIcon(userRank)}</div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden">
            <div className="bg-white/10 px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">
                Day {selectedDay} - {getDayDate(selectedDay)} Leaderboard
                {selectedDay === currentDay && " (Today)"}
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-300 mt-2">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-300">
                <div className="text-4xl mb-2">🏆</div>
                No completions yet for this day.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-6 py-4 flex items-center justify-between transition-colors ${
                      currentUser && entry.id === currentUser.uid 
                        ? 'bg-white/15 border-l-4 border-l-white' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-2xl min-w-[3.5rem] text-white font-bold">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm lg:text-lg font-semibold text-white">
                          {entry.name || 'Anonymous'}
                          {currentUser && entry.id === currentUser.uid && ' (You)'}
                        </h3>
                        <p className="text-[10px] lg:text-sm text-gray-300">
                          {entry.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Attempts: {entry.attempts}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-white">
                      <p className="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide">
                        Completed
                      </p>
                      <p className="text-sm lg:text-lg font-semibold">
                        {formatTime(entry.completedAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}