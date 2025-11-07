import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Rules = () => {
  const rulesSections = [
    {
      title: 'How to Play',
      icon: '🎮',
      items: [
        'Each day, a new puzzle will be unlocked at 12:00 AM UTC',
        'Solve the puzzle to earn points and climb the leaderboard',
        'Use hints if you get stuck, but they may affect your score',
        'The faster you solve, the more points you earn'
      ]
    },
    {
      title: 'Scoring System',
      icon: '🏆',
      items: [
        'Correct answer on first try: 100 points',
        'Each additional attempt reduces points by 10%',
        'Using a hint reduces points by 25%',
        'Bonus points for solving quickly'
      ]
    },
    {
      title: 'Code of Conduct',
      icon: '⚖️',
      items: [
        'One account per participant',
        'No sharing answers with other players',
        'Be respectful to other participants',
        'Have fun and enjoy the challenge!'
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      {/* Background */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundPosition: 'center bottom',
          backgroundSize: 'cover',
          opacity: 0.8,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center pt-24 pb-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* Main Title */}
          <h1 className={cn(
            "text-5xl md:text-6xl font-bold text-center mb-6 font-pavelt",
            "text-white tracking-wider",
            "[text-shadow:_0_0_10px_rgba(79,70,229,0.5)]"
          )}>
            GAME RULES
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-center text-gray-300 mb-12 font-orbitron max-w-2xl mx-auto">
            Master the challenge with these essential guidelines
          </p>
          
          {/* Rules Container */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 md:p-8 space-y-10">
            {rulesSections.map((section, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="group"
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{section.icon}</span>
                  <h2 className={cn(
                    "text-2xl font-bold font-orbitron",
                    "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
                  )}>
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-3 pl-4 border-l-2 border-white/10 ml-2">
                  {section.items.map((item, itemIndex) => (
                    <motion.li 
                      key={itemIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 + itemIndex * 0.05 }}
                      className="flex items-start group-hover:translate-x-1 transition-transform duration-200"
                    >
                      <span className="text-blue-400 mr-2">▹</span>
                      <span className="text-gray-200">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                {index < rulesSections.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Call to Action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-300 mb-6 font-orbitron">
              Ready to begin your adventure?
            </p>
            <button 
              onClick={() => window.location.href = '/play'}
              className={cn(
                "px-8 py-3 rounded-full font-orbitron font-bold tracking-wider",
                "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                "text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300",
                "transform hover:-translate-y-1"
              )}
            >
              START PLAYING
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Rules;
