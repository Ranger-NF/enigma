import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Welcome to Enigma</h1>
      <p className="text-gray-600">Landing page</p>
      
      <div className="flex flex-col gap-2">
        {!user ? (
          <Button onClick={login} variant="default">
            Sign In
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-green-600">Logged in as: {user}</p>
            <Button onClick={logout} variant="destructive">
              Sign Out
            </Button>
          </div>
        )}
        
        <Button onClick={() => navigate('/play')} variant="outline">
          Play Game
        </Button>
        
        <Button onClick={() => navigate('/leaderboard')} variant="ghost">
          Leaderboard
        </Button>
        
        <Button onClick={() => navigate('/example')} variant="link">
          Example Page
        </Button>
      </div>
    </div>
  );
}

// Will contain:
// - Welcome message
// - Conditional rendering of Sign In button / Profile section based on auth state
// - Navigation to Play page after sign in