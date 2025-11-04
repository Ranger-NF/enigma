import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { getCurrentDay } from '../services/firestoreService';
import { useState, useEffect } from 'react';
// Update the path below if LoadingScreen is located elsewhere
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { currentUser, userProgress } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const day = getCurrentDay();
    setCurrentDay(day);
    
    if (userProgress?.completed) {
      const completed = Object.values(userProgress.completed).filter((day: any) => day.done).length;
      setCompletedDays(completed);
    }
  }, [userProgress]);

  const navLinks = [
    { href: '/', label: 'Home', active: true },
    { href: '/rules', label: 'Rules' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/play', label: 'Play' },
  ];

  const handlePlayClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/play');
    }, 800);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <LoadingScreen isLoading={isLoading} />
      <Navbar01 navigationLinks={navLinks} />
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
            Treasure Hunt
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join our 10-day treasure hunt! One question per day, compete for the fastest completion time, 
            and climb the daily leaderboard.
          </p>
					
					{currentUser ? (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Button 
                onClick={handlePlayClick}
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                Start Today's Challenge
              </Button>
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    navigate('/leaderboard');
                  }, 800);
                }} 
                variant="outline"
                className="px-8 py-4 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-transparent font-semibold rounded-lg transition-all duration-300"
              >
                View Leaderboard
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Button 
                onClick={() => navigate('/signin')} 
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                Sign In to Play
              </Button>
              <Button 
                onClick={() => navigate('/rules')} 
                variant="outline"
                className="px-8 py-4 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-transparent font-semibold rounded-lg transition-all duration-300"
              >
                Read Rules
              </Button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 text-center transform transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-3">Daily Challenges</h3>
              <p className="text-gray-300">
                One question unlocks each day. Solve it and climb the leaderboard!
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 text-center transform transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-white mb-3">Compete & Win</h3>
              <p className="text-gray-300">
                Test your skills against others and see where you stand.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 text-center transform transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-3">Track Progress</h3>
              <p className="text-gray-300">
                Monitor your performance and improve with each challenge.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {currentUser && (
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Your Progress</h2>
            
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{completedDays}</div>
                  <div className="text-gray-300">Days Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Day {currentDay}</div>
                  <div className="text-gray-300">Current Day</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{10 - completedDays}</div>
                  <div className="text-gray-300">Days Remaining</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(completedDays / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-300 text-lg font-medium">
                {completedDays}/10 challenges completed ({Math.round((completedDays / 10) * 100)}%)
              </p>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">How It Works</h2>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: '1',
                title: 'Sign In',
                description: 'Create an account or sign in with Google',
                icon: '🔐'
              },
              {
                number: '2',
                title: 'Daily Question',
                description: 'Answer today\'s challenge quickly',
                icon: '❓'
              },
              {
                number: '3',
                title: 'Compete',
                description: 'Climb the leaderboard',
                icon: '🏆'
              },
              {
                number: '4',
                title: 'Repeat',
                description: 'New challenge every day!',
                icon: '🔄'
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-md rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of players in the ultimate treasure hunt experience. Sign up now and start solving!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate(currentUser ? '/play' : '/signin')} 
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
            >
              {currentUser ? 'Continue Playing' : 'Get Started'}
            </Button>
            <Button 
              onClick={() => navigate('/leaderboard')} 
              variant="outline"
              className="px-8 py-4 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-transparent font-semibold rounded-lg transition-all duration-300"
            >
              View Leaderboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}