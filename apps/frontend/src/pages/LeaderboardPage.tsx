import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentDay, getDailyLeaderboard } from "../services/firestoreService";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  completedAt: any;
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
    const day = getCurrentDay();
    setCurrentDay(day);
    setSelectedDay(day);
    fetchLeaderboard(day);
  }, []);

  const fetchLeaderboard = async (day: number) => {
    setLoading(true);
    try {
      const data = await getDailyLeaderboard(day, 20);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full min-h-screen pt-10 bg-transparent"
    >
      <div className="container mx-auto px-4 md:px-6 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Daily Leaderboard
          </h1>
          <p className="text-gray-300 text-lg">
            See who completed today's challenge the fastest!
          </p>
        </div>

        {/* Day Selector */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Select Day
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }, (_, i) => {
              const day = i + 1;
              const isCurrentDay = day === currentDay;
              const isSelected = day === selectedDay;

              return (
                <Button
                  key={day}
                  onClick={() => handleDayChange(day)}
                  variant={isSelected ? "default" : "outline"}
                  className={`${isCurrentDay && !isSelected
                    ? "bg-white/20 border-white text-white hover:bg-white/30"
                    : ""}`}
                >
                  Day {day}
                  {isCurrentDay && " (Today)"}
                </Button>
              );
            })}
          </div>
        </div>

        {/* User Rank */}
        {currentUser && userRank && (
          <div className="bg-white/10 border border-white/20 text-white px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Your Ranking</h3>
                <p className="text-sm">
                  You are ranked #{userRank} for Day {selectedDay}
                </p>
              </div>
              <div className="text-2xl">{getRankIcon(userRank)}</div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden">
          <div className="bg-white/10 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Day {selectedDay} Leaderboard
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
              No completions yet.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`px-6 py-4 flex items-center justify-between ${
                    currentUser && entry.id === currentUser.uid ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl min-w-[3rem] text-white">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {entry.name || 'Anonymous'}
                        {currentUser && entry.id === currentUser.uid && ' (You)'}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {entry.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-white">
                    <p className="text-sm text-gray-300">Completed at</p>
                    <p className="text-lg">{formatTime(entry.completedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
