// Imports will go here
// - React
// - Leaderboard components
// - Auth context (optional, for showing user's position)
// frontend/src/pages/LeaderboardPage.tsx
export default function LeaderboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p className="text-gray-600">Scores will show here</p>
    </div>
  );
}

// Will contain:
// - Leaderboard display
// - Scoring information
// - Navigation back to play