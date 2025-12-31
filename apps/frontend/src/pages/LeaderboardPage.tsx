import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getAllQuestions,
  getCurrentDay,
  getEnhancedDailyLeaderboard,
} from "../services/firestoreService";
import { motion } from "framer-motion";
import { PageExplainer } from "@/components/ui/pageExplainer";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  attempts: number;
  completedAt: any;
}

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalDays, setTotalDays] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return; // wait for auth
      const allQuestions = await getAllQuestions(currentUser);
      setTotalDays(allQuestions.length);

      const day = await getCurrentDay(currentUser);
      setCurrentDay(day);
      setSelectedDay(day);
      fetchLeaderboard(day);
    };

    load();
  }, [currentUser]);

  const fetchLeaderboard = async (day: number) => {
    setLoading(true);
    try {
      // Use enhanced leaderboard with attempts tracking
      const data = await getEnhancedDailyLeaderboard(day, 20);
      setLeaderboard(data);
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

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return [
      date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-transparent py-14"
    >
      <div className="flex flex-col container mx-auto px-4 md:px-6 pt-8 gap-6 lg:gap-12">
        <PageExplainer pageTitle="Leaderboard" />

        {/* Header */}
        <div className="text-center lg:mt-4">
          <h1 className="text-base lg:text-4xl font-bold font-whirlyBirdie">
            Daily Leaderboard
          </h1>
          <p className="text-[10px] lg:text-lg">
            See who completed challenge the fastest!
          </p>
        </div>

        <div className="space-y-12">
          {/* Day Selector */}
          <div className="bg-black backdrop-blur-lg border border-white/10 rounded-lg p-4 lg:p-6">
            <h2 className="text-xs lg:text-xl font-extrabold mb-4 text-white font-whirlyBirdie">
              Select Day
            </h2>
            <div className="scrollbar flex flex-wrap gap-2 lg:gap-3 max-h-24 overflow-y-auto">
              {Array.from({ length: totalDays }, (_, i) => {
                const day = i + 1;
                const isSelected = day === selectedDay;

                return (
                  <button
                    key={day}
                    onClick={() => handleDayChange(day)}
                    disabled={day > currentDay}
                    className={`transition-all border w-16 lg:w-40 py-1 border-white ${
                      isSelected
                        ? "bg-white text-black hover:bg-gray-200"
                        : day > currentDay
                          ? "border-white text-white opacity-40 cursor-not-allowed"
                          : "border-white text-white  hover:bg-white/10"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-whirlyBirdie font-bold text-[9.75px] lg:text-xl">
                        Day {day}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-black overflow-hidden text-white">
            <div className="px-6 py-8 border border-white">
              <h2 className="text-xs lg:text-xl font-bold font-whirlyBirdie">
                Day {selectedDay} - Leaderboard
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
              <div className="divide-y divide-white">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-[40px_0.8fr_0.4fr] lg:grid-cols-[100px_0.8fr_0.2fr] justify-center transition-colors ${
                      currentUser && entry.id === currentUser.uid
                        ? "bg-white/15"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex justify-center items-center text-center border-r border-white text-[9.87px] lg:text-4xl font-bold">
                      {entry.rank}
                    </div>

                    {/* Name and attempts */}
                    <div className="border-r border-white p-4 lg:p-6 flex-1">
                      <h3 className="font-whirlyBirdie text-[10.59px] lg:text-lg font-semibold">
                        {entry.name || "Anonymous"}
                        {currentUser &&
                          entry.id === currentUser.uid &&
                          " (You)"}
                      </h3>
                      <p className="text-[10.59px] lg:text-lg mt-1">
                        Attempts: {entry.attempts}
                      </p>
                    </div>

                    {/* Completetion time */}
                    <div className="border-r border-white p-4 lg:p-6 flex flex-col gap-1">
                      <p className="font-whirlyBirdie text-[6.58px] lg:text-lg font-bold">
                        {formatTime(entry.completedAt)[0]}
                      </p>
                      <p className="font-whirlyBirdie text-[6.58px] lg:text-lg font-bold">
                        {formatTime(entry.completedAt)[1]}
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
