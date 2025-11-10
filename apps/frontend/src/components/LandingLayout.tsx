import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

import { useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import ThreeParticles from "./ThreeParticles"; // stars only on home
import React from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import * as reactSpring from '@react-spring/three'

import { Navbar } from "./Navbar";


interface LandingLayoutProps {
  children?: React.ReactNode;
  isSignInPage?: boolean;
}

const LandingLayout = ({ children, isSignInPage = false }: LandingLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

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



  const isHome = location.pathname === "/";

  return (
    <div
      {...handlers}
      className={cn("min-h-screen w-full relative overflow-hidden", !isSignInPage && "bg-black")}
    >
      {/* Background shown on ALL pages */}
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          top: 0,
        }}
      >
        <ShaderGradient
          control='query'
 urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1&cAzimuthAngle=180&cDistance=1.8&cPolarAngle=80&cameraZoom=9.1&color1=%23606080&color2=%238d7dca&color3=%23212121&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=40&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1.5&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=36.4&rangeStart=9.8&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=2.6&uFrequency=0&uSpeed=0.1&uStrength=0.7&uTime=9.8&wireframe=false&zoomOut=false"        />
      </ShaderGradientCanvas>
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
