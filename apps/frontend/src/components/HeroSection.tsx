import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const HeroSection = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/play');
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="relative h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-40">
      <div className="max-w-5xl mx-auto text-center">
        {/* Main Title */}
        <h1 className={cn(
          "text-7xl sm:text-8xl md:text-8xl lg:text-9xl font-black",
          "text-white",
          "font-pavelt leading-[0.9] mb-6 relative tracking-[0.2em]",
          "[text-shadow:_0_0_4px_#333395,0_0_4px_#333395,0_0_4px_#333395,0_0_4px_#333395,0_0_4px_#333395,0_0_4px_#333395,0_0_4px_#333395,0_0_4px_#333395,0_0_4px_#333395,0_0_4px_#333395]",
          "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
        )}>
          <span className="relative z-10">ENIGMA</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-4xl text-white mb-12 max-w-2xl mx-auto font-semibold tracking-wider font-orbitron">
          Online Treasure Hunt
        </p>
        
        {/* CTA Button */}
        <div className="mt-8">
          <button
            onClick={handleGetStarted}
            className={cn(
              "px-12 py-4 rounded-full text-base font-semibold",
              "bg-gradient-to-r from-blue-600 to-purple-700 text-white",
              "transform transition-all duration-300 hover:scale-105",
              "shadow-lg hover:shadow-xl shadow-blue-500/30"
            )}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
