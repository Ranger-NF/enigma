import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

import { useEffect } from "react";
import MouseTrail from "./ui/MouseTrail";
import { useSwipeable } from "react-swipeable";
import ThreeParticles from "./ThreeParticles"; // stars only on home
import bg from "@/assets/background.png";

import { Navbar } from "./Navbar";
import Footer from "./ui/footer";


interface LandingLayoutProps {
  children?: React.ReactNode;
  isSignInPage?: boolean;
}

const LandingLayout = ({ children, isSignInPage = false }: LandingLayoutProps) => {
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <div
      className={cn("min-h-dvh w-full relative overflow-hidden", !isSignInPage && "bg-black")}
    >
      {/* Background shown on ALL pages */}
      <div
        className="fixed inset-0 w-full h-screen bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundPosition: "center bottom",
          opacity: 0.55,
        }}
      />

      {/* Soft top/bottom fades so content reads clearly on every page */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent z-10" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent z-10" />

      {/* Stars ONLY on home page */}
      {isHome && <ThreeParticles />}

    {/* NAVBAR */}
      <Navbar isSignInPage={isSignInPage} />

      {/* PAGE CONTENT */}
      <main
        className={cn(
          // Pull content a bit higher so home hero sits “more up”
          "relative z-20 min-h-screen flex flex-col",
          isSignInPage && "bg-gradient-to-br from-gray-900/60 to-black/60"
        )}
      >
        {children || <Outlet />}
      </main>

      {!isHome && <Footer/>}
    </div>
  );
};

export default LandingLayout;
