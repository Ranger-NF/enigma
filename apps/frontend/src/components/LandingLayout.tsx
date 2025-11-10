import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import ThreeParticles from "./ThreeParticles"; // stars only on home
import bg from "@/assets/background.png";
import Logo from '@/assets/logo1.png';


interface LandingLayoutProps {
  children?: React.ReactNode;
  isSignInPage?: boolean;
}

const LandingLayout = ({ children, isSignInPage = false }: LandingLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

const routeOrder = ['/', '/how-it-works', '/rules', '/leaderboard', '/about-us', '/play'];

  const currentIndex = routeOrder.indexOf(location.pathname);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < routeOrder.length - 1) navigate(routeOrder[currentIndex + 1]);
    },
    onSwipedRight: () => {
      if (currentIndex > 0) navigate(routeOrder[currentIndex - 1]);
    },
    trackMouse: true,
  });

  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => {
        if (currentIndex < routeOrder.length - 1) navigate(routeOrder[currentIndex + 1]);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentIndex, navigate]);

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
    { name: "How It Works", path: "/how-it-works"}, 
    { name: "Rules", path: "/rules" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "About", path: "/about-us" },
    { name: "Play", path: "/play" },
  ];

  const isHome = location.pathname === "/";

  return (
    <div
      {...handlers}
      className={cn("min-h-screen w-full relative overflow-hidden", !isSignInPage && "bg-black")}
    >
      {/* Background shown on ALL pages */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          opacity: 0.55, // brighter background globally
          filter: "saturate(110%)",
        }}
      />

      {/* Soft top/bottom fades so content reads clearly on every page */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent z-10" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent z-10" />

      {/* Stars ONLY on home page */}
      {isHome && <ThreeParticles />}

    {/* NAVBAR */}
<header className="fixed top-0 left-0 right-0 z-50 py-4 bg-transparent">
  <div className="container mx-auto px-6">
    <div className="flex items-center justify-between">
      <Link to="/" className="flex items-center">
        <div className="flex items-center space-x-2">
          <img 
            src={Logo} 
            alt="Enigma Logo" 
              className="h-20 w-auto object-contain mix-blend-screen brightness-[1.3] select-none"
          />
          <h1 className="text-2xl font-bold text-white font-orbitron">ENIGMA</h1>
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

      {/* PAGE CONTENT */}
      <main
        className={cn(
          // Pull content a bit higher so home hero sits “more up”
          "relative z-20 min-h-screen flex flex-col pt-30 md:pt-16",
          isSignInPage && "bg-gradient-to-br from-gray-900/60 to-black/60"
        )}
      >
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default LandingLayout;
