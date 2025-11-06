const AboutUs = () => {
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" 
         style={{ backgroundImage: 'url(/background.png)' }}>
      <div className="min-h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-8 text-white">
          <h1 className="text-4xl font-bold mb-8 text-center">About Enigma</h1>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
            <p className="mb-4 text-lg">
              Enigma is an online treasure hunt platform where players can test their problem-solving skills
              with daily challenges. Each day, a new puzzle is unlocked, and players compete to solve them
              as quickly as possible to climb the leaderboard.
            </p>
            <p className="text-lg">
              Our mission is to create an engaging and challenging experience that brings together puzzle
              enthusiasts from around the world. Whether you're a seasoned puzzle solver or just looking
              for some fun, Enigma has something for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
