import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentDay, getDailyLeaderboard } from "../services/firestoreService";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  completedAt: any;
  rank: number;
}

// Cache configuration - 5 minute cache to reduce Firestore reads
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const leaderboardCache = new Map<number, { data: LeaderboardEntry[], timestamp: number }>();

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
      
      // Find user's rank
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
    setLeaderboard([]); // Clear leaderboard before fetching new data
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
    if (rank === 3) return "🥉"; // <-- Fix here
    return `#${rank}`;
  };

  return (
    <div className="relative w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Daily Leaderboard
          </h1>
          <p className="text-muted-foreground text-lg">
            See who completed today's challenge the fastest!
          </p>
        </div>

        {/* Day Selector */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
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
                  className={`${
                    isCurrentDay && !isSelected
                      ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                      : ""
                  }`}
                >
                  Day {day}
                  {isCurrentDay && " (Today)"}
                </Button>
              );
            })}
          </div>
        </div>

        {/* User's Rank (if applicable) */}
        {currentUser && userRank && (
          <div className="bg-primary/10 border border-primary/20 text-primary px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Your Ranking</h3>
                <p className="text-sm">
                  You're currently ranked #{userRank} for Day {selectedDay}
                </p>
              </div>
              <div className="text-2xl">{getRankIcon(userRank)}</div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="bg-muted px-6 py-4">
            <h2 className="text-xl font-semibold text-foreground">
              Day {selectedDay} Leaderboard
              {selectedDay === currentDay && " (Today)"}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">
                Loading leaderboard...
              </p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No completions yet
              </h3>
              <p className="text-muted-foreground">
                {selectedDay === currentDay
                  ? "Be the first to complete today's challenge!"
                  : `No one completed Day ${selectedDay} yet.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`px-6 py-4 flex items-center justify-between ${
                    currentUser && entry.id === currentUser.uid ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-foreground min-w-[3rem]">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {entry.name || 'Anonymous'}
                        {currentUser && entry.id === currentUser.uid && ' (You)'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {entry.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Completed at
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatTime(entry.completedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {leaderboard.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {leaderboard.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Completions
              </div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {leaderboard.length > 0
                  ? formatTime(leaderboard[0].completedAt)
                  : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">Fastest Time</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {selectedDay === currentDay ? "Live" : "Final"}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
