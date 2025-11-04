import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LogOut } from 'lucide-react';

const LandingLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const isSignInPage = location.pathname === '/signin';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Rules', path: '/rules' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about-us' },
    { name: 'Play', path: '/play' },
  ];

  return (
    <div className={cn(
      "min-h-screen w-full relative overflow-hidden",
      !isSignInPage && "bg-black"
    )}>
      {/* Background Image - Only show on non-signin pages */}
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
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isSignInPage ? "bg-transparent" : "bg-black/30 backdrop-blur-md"
      )}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo on the left */}
            <Link to="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h1 className="text-2xl font-bold text-white font-orbitron">ENIGMA</h1>
              </div>
            </Link>
            
            {/* Center Navigation */}
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
                  <span className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300",
                    "group-hover:w-full",
                    location.pathname === item.path && "w-full"
                  )} />
                </Link>
              ))}
            </nav>
            
            {/* Right side - Sign In/Profile */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'User'} />
                        <AvatarFallback>
                          {currentUser.displayName ? 
                            currentUser.displayName.charAt(0).toUpperCase() : 
                            currentUser.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer"
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-500 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : !isSignInPage ? (
                <Link 
                  to="/signin" 
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:opacity-90 transition-opacity"
                >
                  Sign In
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button className="text-white p-2 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      
      {/* Main Content */}
      <main className={cn(
        "relative z-10 min-h-screen flex flex-col pt-24",
        isSignInPage ? "bg-gradient-to-br from-gray-900 to-black" : ""
      )}>
        <Outlet />
      </main>
    </div>
  );
};

export default LandingLayout;
