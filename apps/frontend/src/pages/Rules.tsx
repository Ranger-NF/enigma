const Rules = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 text-white max-w-4xl pt-24">
        <h1 className="text-4xl font-bold mb-8 text-center">Game Rules</h1>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-blue-400">How to Play</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Each day, a new puzzle will be unlocked at 12:00 AM UTC</li>
              <li>Solve the puzzle to earn points and climb the leaderboard</li>
              <li>Use hints if you get stuck, but they may affect your score</li>
              <li>The faster you solve, the more points you earn</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-blue-400">Scoring</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Correct answer on first try: 100 points</li>
              <li>Each additional attempt reduces points by 10%</li>
              <li>Using a hint reduces points by 25%</li>
              <li>Bonus points for solving quickly</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-blue-400">Rules</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>One account per participant</li>
              <li>No sharing answers with other players</li>
              <li>Be respectful to other participants</li>
              <li>Have fun and enjoy the challenge!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;
