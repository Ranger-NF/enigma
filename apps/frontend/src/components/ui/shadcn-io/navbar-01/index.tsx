'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const googleProvider = new GoogleAuthProvider();

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 324 323' fill='currentColor' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect
        x='88.1023'
        y='144.792'
        width='151.802'
        height='36.5788'
        rx='18.2894'
        transform='rotate(-38.5799 88.1023 144.792)'
        fill='currentColor'
      />
      <rect
        x='85.3459'
        y='244.537'
        width='151.802'
        height='36.5788'
        rx='18.2894'
        transform='rotate(-38.5799 85.3459 244.537)'
        fill='currentColor'
      />
    </svg>
  );
};

// Custom hook to combine refs
function useCombinedRefs<T>(...refs: any[]) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

// Hamburger icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

// Types
export interface Navbar01NavLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface Navbar01Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar01NavLink[];
  signInText?: string;
  signInHref?: string;
  onSignInClick?: () => void;
}

// Default navigation links
const defaultNavigationLinks: Navbar01NavLink[] = [
  { href: '/', label: 'Home', active: true },
  { href: '/rules', label: 'Rules' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
  { href: '/play', label: 'Play' },
];

export const Navbar01 = React.forwardRef<HTMLDivElement, Navbar01Props>(
  (
    {
      logo = <Logo />,
      logoHref = '/',
      navigationLinks = defaultNavigationLinks,
      signInText = 'Sign In',
      signInHref = '/signin',
      onSignInClick,
      className,
      ...props
    },
    ref
  ) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = React.useState(false);
    const combinedRef = useCombinedRefs(ref, containerRef);
    const navigate = useNavigate();
    const { currentUser, signOut } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error(error);
      }
    };

    const handlePlayClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      if (currentUser) {
        navigate('/play');
      } else {
        navigate('/signin', { state: { from: '/play' } });
      }
    };

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 0);
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };

      checkWidth();

      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <>
        <header
          className={cn(
            'fixed w-full z-50 transition-all duration-500',
            isScrolled ? 'bg-gray-900/95 backdrop-blur-md' : 'bg-transparent',
            'py-4',
            className
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold font-orbitron">ENIGMA</span>
              </button>

              {/* Navigation - Hidden on mobile, visible on md and up */}
              <nav className="hidden md:flex items-center space-x-10">
                {navigationLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      if (link.label === 'Play') {
                        handlePlayClick(e, link.href);
                      } else {
                        navigate(link.href);
                      }
                    }}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      link.active || location.pathname === link.href
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white',
                      'whitespace-nowrap cursor-pointer'
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Right side - Auth */}
              <div className="flex items-center space-x-4">
                {/* Auth controls */}
                <div className="flex items-center space-x-4">
                  {currentUser ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-10 w-10 rounded-full p-0 hover:bg-white/10"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || 'User'} />
                            <AvatarFallback>
                              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {currentUser.displayName || 'User'}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {currentUser.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sign out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      onClick={() => navigate('/signin')}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:opacity-90 transition-opacity"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
                <ModeToggle className="text-gray-300 hover:bg-white/10" />
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white p-2 hover:bg-white/10 rounded-md transition-colors"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16m-7 6h7"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={cn(
              'md:hidden fixed inset-0 bg-gray-900/95 backdrop-blur-md z-40 transition-all duration-300 overflow-y-auto',
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none',
              'flex flex-col items-center justify-center'
            )}
          >
            <nav className="w-full max-w-xs space-y-2">
              {navigationLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={(e) => {
                    if (link.label === 'Play') {
                      e.preventDefault();
                      handlePlayClick(e as any, link.href);
                    } else {
                      navigate(link.href);
                    }
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    'block w-full text-center px-6 py-3 rounded-lg text-base font-medium',
                    'transition-colors',
                    location.pathname === link.href
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {link.label}
                </button>
              ))}
              {currentUser ? (
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  My Profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/signin');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
              {currentUser && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  Sign Out
                </button>
              )}
            </nav>
          </div>
        </header>
        {/* Add padding to account for fixed header */}
        <div className="h-16 md:h-20"></div>
      </>
    );
  }
);

Navbar01.displayName = 'Navbar01';

export { Logo, HamburgerIcon };
