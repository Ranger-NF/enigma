import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

interface LandingLayoutProps {
  children?: React.ReactNode;
  isSignInPage?: boolean;
}

const LandingLayout = ({ children, isSignInPage = false }: LandingLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  const routeOrder = ['/', '/rules', '/leaderboard', '/about-us', '/play'];
  const currentIndex = routeOrder.indexOf(location.pathname);


  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < routeOrder.length - 1) {
        navigate(routeOrder[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        navigate(routeOrder[currentIndex - 1]);
      }
    },
    trackMouse: true, 
  });

 
  useEffect(() => {
    if (location.pathname === '/') {
      const timer = setTimeout(() => {
        if (currentIndex < routeOrder.length - 1) {
          navigate(routeOrder[currentIndex + 1]); 
        }
      }, 15000); 

      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentIndex, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Rules', path: '/rules' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about-us' },
    { name: 'Play', path: '/play' },
  ];

  return (
    <div
      {...handlers} 
      className={cn(
        "min-h-screen w-full relative overflow-hidden",
        !isSignInPage && "bg-black"
      )}
    >
      {/* Background Image */}
      {!isSignInPage && (
        <>
          <div
            className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 transition-all duration-1000"
            style={{
              backgroundImage: 'url(/background.png)',
              backgroundPosition: 'center bottom',
              backgroundSize: 'cover',
              opacity: 0.8,
            }}
          />
          <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 z-0" />
        </>
      )}

      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 py-4",
          isSignInPage ? "bg-transparent" : "bg-transparent"
        )}
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h1 className="text-2xl font-bold text-white font-orbitron">ENIGMA</h1>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium uppercase tracking-wider transition-colors relative group",
                    location.pathname === item.path
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  {item.name}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300",
                      "group-hover:w-full",
                      location.pathname === item.path && "w-full"
                    )}
                  />
                </Link>
              ))}
            </nav>

            {/* Profile / Auth */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <Avatar className="h-10 w-10 border-2 border-white/20">
                        <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'User'} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {currentUser.displayName
                            ? currentUser.displayName.charAt(0).toUpperCase()
                            : currentUser.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-gray-900 border border-gray-800">
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer text-gray-200 hover:bg-gray-800 focus:bg-gray-800"
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 hover:bg-gray-800 focus:bg-gray-800"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : !isSignInPage ? (
                <Link
                  to="/signin"
                  className="px-6 py-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 transition-all border border-gray-300 rounded-full font-semibold tracking-wide shadow-sm"
                >
                  SIGN UP
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button className="text-white p-2 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Page Content */}
      <main
        className={cn(
          "relative z-10 min-h-screen flex flex-col pt-24",
          isSignInPage ? "bg-gradient-to-br from-gray-900 to-black" : ""
        )}
      >
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default LandingLayout;
