import { Link, useNavigate } from 'react-router-dom';
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
    <div className="relative h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-5xl mx-auto text-center">
        {/* Main Title */}
        <h1 className={cn(
          "text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text",
          "bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500",
          "font-orbitron tracking-tight leading-[0.9] mb-6",
          "animate-text-shimmer bg-[length:200%_auto] bg-clip-text text-transparent",
          "drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
        )}>
          ENIGMA
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-12 max-w-2xl mx-auto font-light tracking-wider font-montserrat">
          Online Treasure Hunt
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16">
          <button
            onClick={handleGetStarted}
            className={cn(
              "relative px-8 py-4 rounded-full text-lg font-medium overflow-hidden group",
              "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
              "transform transition-all duration-300 hover:scale-105",
              "shadow-lg hover:shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50"
            )}
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <Link
            to="/rules"
            className={cn(
              "px-8 py-4 rounded-full text-lg font-medium",
              "bg-transparent text-white border-2 border-white/30",
              "hover:bg-white/10 transition-all duration-300",
              "transform hover:scale-105"
            )}
          >
            Learn More
          </Link>
        </div>
        
        {/* Scrolling Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
