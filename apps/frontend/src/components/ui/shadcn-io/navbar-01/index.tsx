"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/UserAvatar';
import { LogOut, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import Logo from '@/assets/logo1.png'; 

export interface Navbar01NavLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface Navbar01Props extends React.HTMLAttributes<HTMLElement> {
  navigationLinks?: Navbar01NavLink[];
}

const defaultNavigationLinks: Navbar01NavLink[] = [
  { href: '/', label: 'Home', active: true },
  { href: '/Rules', label: 'Rules' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
  { href: '/play', label: 'Play' },
];

export const Navbar01 = React.forwardRef<HTMLDivElement, Navbar01Props>(
  (
    {
      navigationLinks = defaultNavigationLinks,
      className,
      ...props
    },
    ref
  ) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
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
      if (currentUser) navigate('/play');
      else navigate('/signin', { state: { from: '/play' } });
    };

    useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 0);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
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

              {/* ✅ Updated Logo with PNG */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
              >
                <img
                  src={Logo}
                  alt="Enigma Logo"
                  className="h-10 w-auto select-none"
                />
                <span className="text-2xl font-bold font-orbitron text-white">ENIGMA</span>
              </button>

              {/* Navigation (Desktop) */}
              <nav className="hidden md:flex items-center space-x-10">
                {navigationLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => link.label === 'Play' ? handlePlayClick(e, link.href) : navigate(link.href)}
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

              {/* Auth + Theme */}
              <div className="flex items-center space-x-4">
                {currentUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-white/10">
                        <UserAvatar user={currentUser} size="sm" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{currentUser.displayName || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    onClick={() => navigate('/signin')}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 rounded-full"
                  >
                    Sign In
                  </Button>
                )}
                <ModeToggle />
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white p-2 hover:bg-white/10 rounded-md transition-colors"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <X className="h-6 w-6 rotate-90" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="h-16 md:h-20"></div>
      </>
    );
  }
);

Navbar01.displayName = "Navbar01";
