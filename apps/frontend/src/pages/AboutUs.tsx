import EnigmaLogo from "@/assets/logo1.png"
import InventoLogo from"@/assets/invento.png"
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className=" flex flex-col min-h-screen w-full  justify-center items-center gap-12 lg:gap-32 px-4 md:px-10 bg-transparent relative z-10 py-16 lg:py-52  pb-8 lg:pb-4"
    >
      {/* ENIGMA SECTION */}
      <div className="flex md:flex-row flex-col pb-10 items-center md:gap-10 md:w-[80%] md:h-[45vh]">

        {/* Logo */}
        <div className="w-32 md:w-48 h-full flex pt-14 md:pt-0 items-center justify-center">
          <img
            src={EnigmaLogo}
            alt="Enigma Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div
          className={cn(
            "bg-white/6 backdrop-blur-xl rounded-2xl border border-white/15",
            "p-6 md:p-8 space-y-10 w-full max-w-4xl",
            "h-[65vh] overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent"
          )}
        >
          <h2 className="text-3xl text-center lg:text-left font-bold mb-3">Enigma</h2>
          <p className="text-lg leading-relaxed">
            Enigma is the ultimate puzzle hunter under Invento, GEC Palakkad —
            a game where curiosity meets chaos and logic meets imagination.
            <br /><br />
            Each day brings a single, mind-bending clue — it could be an image,
            a waveform, a phrase, or even a mysterious sound clip.
            <br /><br />
            Decode the hidden meaning, connect the dots, and uncover the final answer.
            <br /><br />
            It’s not just a quiz — it’s a journey through riddles, symbols, and creativity.
          </p>

        </div>
      </div>

      {/* INVENTO SECTION */}
      <div className="flex md:flex-row flex-col items-center gap-10 md:w-[80%] md:h-[45vh] lg:pt-44">

        {/* Logo */}
        <div className="w-32 md:w-48 h-full flex items-center justify-center">
          <img
            src={InventoLogo}
            alt="Invento Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div
          className={cn(
            "bg-white/6 backdrop-blur-xl rounded-2xl border border-white/15",
            "p-6 md:p-8 space-y-10 w-full max-w-4xl",
            "h-[65vh] overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent"
          )}
        >
          <h2 className="text-3xl text-center lg:text-left  font-bold mb-3">Invento '26</h2>
          <p className="text-lg leading-relaxed">
            Invento is the annual techno-cultural fest of Government Engineering
            College, Palakkad.
            <br /><br />
            It is where innovation, creativity, and collaboration collide.
            <br /><br />
            Students from multiple colleges come together showcasing ideas,
            technical skill, culture, and passion for discovery.
            <br /><br />
            From hackathons to cultural nights, Invento celebrates learning
            beyond the classroom.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutUs;
