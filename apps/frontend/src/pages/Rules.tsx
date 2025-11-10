import { cn } from "../lib/utils";

interface RuleSection {
  title: string;
  icon: string;
  items: string[];
}

const Rules = () => {
  const rulesSections: RuleSection[] = [
    {
      title: "How to Play",
      icon: "🎮",
      items: [
        "Each day, a new puzzle will be unlocked at 12:00 AM UTC",
        "Solve the puzzle to earn points and climb the leaderboard",
        "Use hints if you get stuck, but they may affect your score",
        "The faster you solve, the more points you earn"
      ]
    },
    {
      title: "Scoring System",
      icon: "🏆",
      items: [
        "Correct answer on first try: 100 points",
        "Each additional attempt reduces points by 10%",
        "Using a hint reduces points by 25%",
        "Bonus points for solving quickly"
      ]
    },
    {
      title: "Code of Conduct",
      icon: "⚖️",
      items: [
        "One account per participant",
        "No sharing answers with other players",
        "Be respectful to other participants",
        "Have fun and enjoy the challenge!"
      ]
    }
  ];

  return (
    <div className="h-screen w-full relative overflow-hidden bg-transparent">

      {/* Page container, no scroll */}
      <div className="relative z-10 h-full flex flex-col items-center pt-20 pb-6 px-2 overflow-hidden">

        {/* Title */}
        <h1
          className={cn(
            "text-4xl md:text-5xl font-bold text-center mb-4 font-orbitron",
            "text-white tracking-wider",
            "[text-shadow:_0_0_10px_rgba(79,70,229,0.6)]"
          )}
        >
          GAME RULES
        </h1>

        <p className="text-lg text-center text-gray-300 mb-4 font-orbitron max-w-xl">
          Master the challenge with these essential guidelines
        </p>

        {/* Scrollable Rules Box */}
        <div
          className={cn(
            "bg-white/6 backdrop-blur-xl rounded-2xl border border-white/15",
            "p-6 md:p-8 space-y-10 w-full max-w-4xl",
            "h-[65vh] overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent"
          )}
        >
          {rulesSections.map((section, index) => (
            <div key={index}>
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{section.icon}</span>
                <h2 className="text-2xl font-bold font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {section.title}
                </h2>
              </div>

              <ul className="space-y-3 pl-4 border-l-2 border-white/10 ml-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="text-purple-300 mr-2">▹</span>
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>

              {index < rulesSections.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => (window.location.href = "/play")}
          className={cn(
            "mt-6 px-8 py-3 rounded-full font-orbitron font-semibold tracking-wide",
            "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
            "text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300",
            "transform hover:-translate-y-1"
          )}
        >
          START PLAYING
        </button>

      </div>
    </div>
  );
};

export default Rules;
