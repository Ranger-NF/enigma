import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import Logo from '@/assets/logo1.png';
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

import { useAuth } from "../contexts/AuthContext";

export function Navbar({ isSignInPage = false, className }: { isSignInPage?: boolean, className?: String }) {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };
  const navItems = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Rules", path: "/rules" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "About", path: "/about-us" },
    { name: "Play", path: "/play" },
  ];
  return (
    <header className={`absolute top-0 left-0 right-0 z-50 py-4 bg-transparent ${className}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="flex items-center space-x-2">
              <img
                src={Logo}
                alt="Enigma Logo"
                className="h-14 w-auto object-contain mix-blend-screen brightness-[1.3] select-none"
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "text-sm font-medium uppercase tracking-wider transition-colors relative group",
                  location.pathname === item.path ? "text-white" : "text-gray-300 hover:text-white"
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

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarImage src={currentUser.photoURL || ""} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {currentUser.displayName?.[0]?.toUpperCase() ||
                          currentUser.email?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-gray-900 border border-gray-800">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isSignInPage ? (
              <Link
                to="/signin"
                className="px-6 py-2 text-sm font-semibold rounded-full border border-white/30 shadow-sm
                               bg-white/25 text-white backdrop-blur hover:bg-white/35 transition"
              // ↑ more transparent button per request
              >
                SIGN UP
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
