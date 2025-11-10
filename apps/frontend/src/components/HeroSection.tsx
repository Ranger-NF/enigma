import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

const HeroSection = () => {
  const { currentUser } = useAuth();

  return (
    <div className="relative h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-20 select-none">

      <div className="max-w-5xl mx-auto text-center">

        
        <h1
          className={cn(
            "text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black",
            "text-white font-pavelt leading-[0.9] mb-4 relative tracking-[0.20em]",
            "[text-shadow:_0_0_4px_#333395,0_0_6px_#333395,0_0_8px_#333395,0_0_12px_#333395]",
            "drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          )}
        >
          ENIGMA
        </h1>

        {/* Subtitle (from first code) */}
        <p className="text-3xl sm:text-4xl text-white mb-12 max-w-2xl mx-auto font-semibold tracking-wider font-orbitron">
          Online Treasure Hunt
        </p>

        {/* Buttons (from second code, login-aware) */}
        <div className="mt-40 flex flex-wrap items-center justify-center gap-9">

          {currentUser ? (
            <>
              <Link
                to="/play"
                className="px-10 py-4 rounded-full text-lg font-semibold
                backdrop-blur-md bg-white/12 border border-purple-300/40 text-white 
                hover:bg-purple-500/25 hover:shadow-[0_0_30px_rgba(150,100,255,0.55)]
                transition-all duration-300 hover:-translate-y-1"
              >
                Start Today's Challenge
              </Link>

              <Link
                to="/leaderboard"
                className="px-10 py-4 rounded-full text-lg font-medium
                backdrop-blur-md bg-white/6 border border-white/30 text-white/90 
                hover:bg-white/15 hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.45)]
                transition-all duration-300 hover:-translate-y-1"
              >
                View Leaderboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="px-10 py-4 rounded-full text-lg font-semibold
                backdrop-blur-md bg-white/12 border border-purple-300/40 text-white 
                hover:bg-purple-500/25 hover:shadow-[0_0_30px_rgba(150,100,255,0.55)]
                transition-all duration-300 hover:-translate-y-1"
              >
                Sign In to Play
              </Link>

              <Link
                to="/how-it-works"
                className="px-10 py-4 rounded-full text-lg font-medium
                backdrop-blur-md bg-white/6 border border-white/30 text-white/90 
                hover:bg-white/15 hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.45)]
                transition-all duration-300 hover:-translate-y-1"
              >
                Learn More
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default HeroSection;
