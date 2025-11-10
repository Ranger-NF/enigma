const AboutUs = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center gap-12 px-10 bg-transparent relative z-10">
      {/* ENIGMA SECTION */}
      <div className="flex items-center gap-10 w-[80%] h-[45vh]">

        {/* Logo */}
        <div className="w-48 h-full flex items-center justify-center">
          <img
            src="logo1.png"
            alt="Enigma Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Scrollable Text Box */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full h-full overflow-y-auto text-white">
          <h2 className="text-3xl font-bold mb-3">Enigma</h2>
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
      <div className="flex items-center gap-10 w-[80%] h-[45vh]">

        {/* Logo */}
        <div className="w-48 h-full flex items-center justify-center">
          <img
            src="/invento-logo.png"
            alt="Invento Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Scrollable Text Box */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full h-full overflow-y-auto text-white">
          <h2 className="text-3xl font-bold mb-3">Invento '26</h2>
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
    </div>
  );
};

export default AboutUs;
