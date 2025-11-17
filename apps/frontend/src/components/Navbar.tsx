import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Menu, X } from "lucide-react";
import Logo from '@/assets/logo1.png';
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";


export function Navbar({ isSignInPage = false, className }: { isSignInPage?: boolean, className?: String }) {
    const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 50], [0, 0.2]);
  const blurValue = useTransform(scrollY, [0, 50], [0, 10]);

  const backgroundColor = useTransform(bgOpacity, (v) => `rgba(0, 0, 0, ${v})`);
  const backdropFilter = useTransform(blurValue, (v) => `blur(${v}px)`);

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
    { name: "Rules", path: "/rules" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "About", path: "/about-us" },
    { name: "Play", path: "/play" },
  ];
  return (
    <header className={cn("fixed top-5 left-0 right-0 z-50 py-4 overflow-hidden", className)}>
      <motion.div
        style={{
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          backgroundColor,
          willChange: "backdrop-filter, background-color",
        }}
        className="absolute inset-0 z-0 bg-black/10"
        aria-hidden
      />

      {/* Header content sits above the animated backdrop */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="flex items-center justify-between">

          {/*On Desktop*/}
          <Link to="/" className="hidden lg:flex items-center">
            <div className="flex items-center space-x-2">
              <motion.img
                src={Logo}
                alt="Enigma Logo"
                className="h-14 w-auto object-contain mix-blend-screen brightness-[1.3] select-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </div>
          </Link>

          {/*On Desktop*/}
          <motion.nav
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="hidden lg:flex items-center space-x-24 bg-white/5 border border-white/50 px-12 py-4 rounded-full">
            {navItems.map((item) => (
            <motion.div
              key={item.name}
              variants={{ hidden: { opacity: 0, y: -5 }, visible: { opacity: 1, y: 0 } }}
            >
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "text-sm font-medium uppercase tracking-wider transition-colors relative group",
                  location.pathname === item.path ? "text-white" : "text-gray-400 hover:text-white"
                )}
              >
                {item.name}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300",
                    "group-hover:w-full"
                  )}
                />
              </Link>
            </motion.div>
            ))}
          </motion.nav>

          {/*On Mobile*/}
          <div className="lg:hidden">
            {/* Top bar */}
            <div className="flex justify-between items-center">

              <button onClick={() => setOpen(!open)}>
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <div className="flex items-center space-x-2 pl-4">
                <img
                  src={Logo}
                  alt="Enigma Logo"
                  className="h-12 w-auto object-contain mix-blend-screen brightness-[1.3] select-none"
                />
                <span className="hidden sm:flex font-semibold text-lg">Enigma</span>
              </div>
            </div>

            {/* Slide-in sidebar */}
            <div
              className={cn(
                "fixed inset-y-0 left-0 w-full  bg-black/100 shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto pt-6",
                open ? "translate-x-0" : "-translate-x-full"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <img
                    src={Logo}
                    alt="Enigma Logo"
                    className="h-6 w-auto object-contain mix-blend-screen brightness-[1.3] select-none"
                  />
                  <span className="font-semibold text-lg">Enigma</span>
                </div>
                <button onClick={() => setOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Menu items */}
              <nav className="flex flex-col mt-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-6 py-4 text-white font-medium flex justify-between items-center border-b hover:bg-white hover:text-black transition-colors",
                    )}
                  >
                    {item.name}
                    <span className="text-gray-400">›</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Overlay */}
            {open && (
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setOpen(false)}
              ></div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarImage src={currentUser.photoURL ?? undefined} />
                      <AvatarFallback className="bg-white text-black">
                        {currentUser.displayName?.[0]?.toUpperCase() ||
                          currentUser.email?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-gray-900 border border-gray-800">
                  <DropdownMenuItem>
                    {currentUser.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isSignInPage ? (
              <Link
                to="/signin"
                className="text-sm font-semibold rounded-full border border-white/50 shadow-sm
                               bg-white/25 text-white backdrop-blur hover:bg-white hover:text-black transition py-2 lg:py-4 px-2 lg:px-8"
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
