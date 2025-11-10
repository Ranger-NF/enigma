import { cn } from "../lib/utils";

interface RuleSection {
  title: string;
  icon: string;
  descriptions: string;
}

const Rules = () => {
  const rulesSections: RuleSection[] = [
    {
      title: "Verification",
      icon: "",
      descriptions: "Winners will have to prove they’re real humans (and real students) before collecting their glory."
    },
    {
      title: "Ranking",
      icon: "",
      descriptions: "It’s not just about solving — it’s about how fast you solve. The quickest minds rise to the top, no second chances with time."
    },
    {
      title: "Answer Format",
      icon: "",
      descriptions: "You’ll have to answer exactly as instructed — lowercase, uppercase, spaces, symbols — whatever the rulebook says. We’ll sort that out for you; just spell it right."
    },
    {
      title: "Hints",
      icon: "",
      descriptions: "We might drop a few hints here and there… or maybe not. Keep an eye on the question page; surprises happen when you least expect them."
    },
    {
      title: "Timer",
      icon: "",
      descriptions: "The second you create your account, the game begins. The clock’s been your enemy all along — you just didn’t know it."
    },
    {
      title: "Fair Play",
      icon: "",
      descriptions: "The team holds every right to take action if things go sideways. Play clean, or watch your spot disappear like your last wrong guess."
    },
    {
      title: "Use Your Tools",
      icon: "",
      descriptions: "Google’s your sidekick. Think like a coder, search like a detective. The answer’s always out there — somewhere between logic and luck."
    },
    {
      title: "Hackers",
      icon: "",
      descriptions: "We see you. We like your confidence. But no — just no."
    }
  ];

  return (
    <div className="h-screen w-full relative overflow-hidden bg-transparent pt-12">

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

        <p className="text-md md:text-lg text-center text-gray-300 mb-4 font-orbitron max-w-xl">
          Master the challenge with these essential guidelines
        </p>

        {/* Scrollable Rules Box */}
        <div className="relative">

        <div
          className={cn(
            "bg-white/6 backdrop-blur-xl rounded-2xl border border-white/15",
            "p-6 md:p-8 space-y-2 w-full max-w-4xl",
            "h-[65vh] overflow-y-auto relative",
            "scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent"
          )}
        >
          {rulesSections.map((section, index) => (
            <div key={index}>
              <div className="flex items-center">
                <span className="text-3xl mr-3">{section.icon}</span>
                <h2 className="text-2xl font-bold font-orbitron text-white">
                  {section.title}
                </h2>
              </div>

              <ul className="space-y-2 w-full border-white/10 ml-2">
                <div className="p-2 w-full h-[100px]">
                  {section.descriptions}
                </div>
              </ul>

              {index < rulesSections.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />
              )}
            </div>
          ))}
        </div>
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
