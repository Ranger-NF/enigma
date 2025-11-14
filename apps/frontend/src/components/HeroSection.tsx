import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import Footer from "./ui/footer";

const HeroSection = () => {
  const { currentUser } = useAuth();

  // Animation variants for staggering
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const fadeIn = {
    hidden: { opacity: 0},
    visible: { opacity: 1, transition: { duration: 1.2, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="flex min-h-screen flex flex-col justify-between"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex px-4 sm:px-6 lg:px-8 pt-20 items-start justify-center select-none">
        <div className="max-w-5xl mx-auto md:pt-0 pt-[120px] text-center">

          {/* Title */}
          <motion.h1
            variants={fadeIn}
            className={cn(
              "md:text-8xl text-5xl font-black",
              "text-white font-pavelt leading-[0.9] mb-4 relative tracking-[0.20em]",
              "[text-shadow:_0_0_4px_#333395,0_0_6px_#333395,0_0_8px_#333395,0_0_12px_#333395]",
              "drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]",
              "lg:pt-24"
            )}
          >
            ENIGMA
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeIn}
            className="text-3xl sm:text-4xl text-white mb-12 max-w-2xl mx-auto font-semibold tracking-wider font-orbitron"
          >
            Online Treasure Hunt
          </motion.p>

          {/* Buttons with stagger */}
          <motion.div
            className="mt-40 flex flex-wrap items-center justify-center gap-9"
            variants={containerVariants}
          >
            {(currentUser ? (
              <>
                <motion.div variants={fadeUp}>
                  <Link
                    to="/play"
                    className="px-10 py-4 rounded-full text-lg font-semibold
                    backdrop-blur-md bg-white/12 border border-purple-300/40 text-white
                    hover:bg-purple-500/25 hover:shadow-[0_0_30px_rgba(150,100,255,0.55)]
                    transition-all duration-300 hover:-translate-y-1"
                  >
                    Start Today's Challenge
                  </Link>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Link
                    to="/leaderboard"
                    className="px-10 py-4 rounded-full text-lg font-medium
                    backdrop-blur-md bg-white/6 border border-white/30 text-white/90
                    hover:bg-white/15 hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.45)]
                    transition-all duration-300 hover:-translate-y-1"
                  >
                    View Leaderboard
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div variants={fadeUp}>
                  <Link
                    to="/signin"
                    className="px-10 py-4 rounded-full text-lg font-semibold
                    backdrop-blur-md bg-white/12 border border-purple-300/40 text-white
                    hover:bg-purple-500/25 hover:shadow-[0_0_30px_rgba(150,100,255,0.55)]
                    transition-all duration-300 hover:-translate-y-1"
                  >
                    Sign In to Play
                  </Link>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Link
                    to="/how-it-works"
                    className="px-10 py-4 rounded-full text-lg font-medium
                    backdrop-blur-md bg-white/6 border border-white/30 text-white/90
                    hover:bg-white/15 hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.45)]
                    transition-all duration-300 hover:-translate-y-1"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </>
            ))}
          </motion.div>
        </div>
      </div>

      <Footer/>
    </motion.div>
  );
};

export default HeroSection;
