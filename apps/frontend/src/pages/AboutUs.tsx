import EnigmaLogo from "@/assets/logo1.png";
import InventoLogo from "@/assets/invento.png";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Footer from "../components/ui/footer.tsx";

const InfoContainer = ({
  headline,
  contents,
  imageSrc,
}: {
  headline: string;
  contents: string[];
  imageSrc: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-2 md:gap-5 flex-1 min-h-[60vh]">
      {/* Logo */}
      <div className="flex lg:hidden w-24 h-full lg:w-full lg:h-24 items-center justify-center">
        <img
          src={imageSrc}
          alt={headline + ' Logo'}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Content Box */}
      <div
        className={cn(
          "bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15",
          "h-[50vh] p-6 md:p-8 space-y-4 w-full flex flex-col ",
          "overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent"
        )}
      >
        <div className="flex items-center">
          <h2 className="flex flex-1 text-3xl text-center lg:text-left font-bold lg:mb-3">{headline}</h2>
          <div className="hidden lg:block h-16 w-auto items-start justify-right">
            <img
              src={imageSrc}
              alt={headline + ' Logo'}
              className="h-full object-contain"
            />
          </div>
        </div>
        <div className="text-md space-y-2">
          {contents.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

const AboutUs = () => {
  const enigmaContents = [
    "Enigma is the ultimate puzzle hunter under Invento, GEC Palakkad — a game where curiosity meets chaos and logic meets imagination.",
    "Each day brings a single, mind-bending clue — it could be an image, a waveform, a phrase, or even a mysterious sound clip.",
    "Decode the hidden meaning, connect the dots, and uncover the final answer.",
    "It’s not just a quiz — it’s a journey through riddles, symbols, and creativity.",
  ];

  const inventoContents = [
    "Invento is the annual techno-cultural fest of Government Engineering College, Palakkad.",
    "It is where innovation, creativity, and collaboration collide.",
    "Students from multiple colleges come together showcasing ideas, technical skill, culture, and passion for discovery.",
    "From hackathons to cultural nights, Invento celebrates learning beyond the classroom.",
  ];

  return (
  <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col lg:flex-row min-h-screen w-full justify-center items-center gap-8 px-4 md:px-10 bg-transparent relative z-10 pt-32 pb-8 lg:pb-4 overflow-hidden"
    >
      {/* ENIGMA SECTION */}
      <InfoContainer
        headline="Enigma"
        contents={enigmaContents}
        imageSrc={EnigmaLogo}
      />

      {/* INVENTO SECTION */}
      <InfoContainer
        headline="Invento '26"
        contents={inventoContents}
        imageSrc={InventoLogo}
      />
    </motion.div>

    {/* FOOTER - always stays bottom */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Footer />
    </motion.div>
  </>
);
};

export default AboutUs;
