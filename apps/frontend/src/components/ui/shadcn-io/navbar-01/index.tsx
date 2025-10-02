"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 324 323"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="88.1023"
        y="144.792"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 88.1023 144.792)"
        fill="currentColor"
      />
      <rect
        x="85.3459"
        y="244.537"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 85.3459 244.537)"
        fill="currentColor"
      />
    </svg>
  );
};

// Hamburger icon component
const HamburgerIcon = ({
  className,
  ...props
}: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn("pointer-events-none", className)}
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
  navigationLinks?: Navbar01NavLink[];
  signInText?: string;
  signInHref?: string;
}

const defaultNavigationLinks: Navbar01NavLink[] = [
  { href: "/", label: "Home", active: true },
  { href: "/#rules", label: "Rules" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/play", label: "Play" },
];

export const Navbar01 = React.forwardRef<HTMLElement, Navbar01Props>(
  (
    {
      className,
      logo = <Logo />,
      navigationLinks = defaultNavigationLinks,
      ...props
    },
    ref,
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const location = useLocation();

    const navScroll = (
      e: React.MouseEvent<HTMLButtonElement>,
      link: Navbar01NavLink,
    ) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const [path, hash] = link.href.split("#");
      e.preventDefault();

      // If we're already on the same pathname, do a same-page action:
      // - if there's a hash, scroll to that element
      // - otherwise scroll to top of the page
      if (location.pathname === (path || "/")) {
        if (hash) {
          // update the URL hash so active-link detection sees the change
          navigate(`${path}#${hash}`);
          setTimeout(() => {
            const el = document.querySelector(`#${hash}`);
            el?.scrollIntoView({ behavior: "smooth" });
          }, 80);
        } else {
          // navigate to the path (clears any hash) then scroll to top
          navigate(path || "/");
          setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
        }
        // remove focus so the button doesn't appear 'pressed'
        btn.blur();
        return;
      }

      // Different page → navigate, then scroll to hash after a short delay
      navigate(link.href);
      // remove focus so the button doesn't appear 'pressed'
      btn.blur();
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(`#${hash}`);
          el?.scrollIntoView({ behavior: "smooth" });
        }, 200); // tweak delay (50–150ms usually works)
      }
    };

    // We derive active state from the current pathname so links with hashes
    // (e.g. "/#rules") correctly match the route's pathname ("/") and don't
    // leave another link stuck as active.

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

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate("/");
      } catch (error) {
        console.error(error);
      }
    };

    const handleGoogleSignIn = async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        navigate("/");
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <header
        ref={combinedRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
          className,
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                    variant="ghost"
                    size="icon"
                  >
                    <HamburgerIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-48 p-2">
                  <NavigationMenu className="max-w-none">
                    <NavigationMenuList className="flex-col items-start gap-1">
                      {navigationLinks.map((link, index) => (
                        <NavigationMenuItem key={index} className="w-full">
                          <button
                            onClick={(e) => navScroll(e, link)}
                            className={cn(
                              "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer no-underline",
                              // compute active state by comparing the route path portion
                              // of the link (before any hash) with the current pathname
                              (() => {
                                const [linkPath, linkHash] = link.href.split('#');
                                const normalizedLinkPath = linkPath || '/';
                                const currentHash = location.hash || '';
                                // If link specifies a hash, consider it active only when hash matches
                                if (linkHash) {
                                  return (location.pathname === normalizedLinkPath && currentHash === `#${linkHash}`)
                                    ? "bg-accent text-accent-foreground"
                                    : "text-foreground/80 hover:text-foreground";
                                }
                                // No-hash link: active when pathname matches and there's no hash on the location
                                return (location.pathname === normalizedLinkPath && currentHash === '')
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground/80 hover:text-foreground";
                              })(),
                            )}
                          >
                            {link.label}
                          </button>
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                </PopoverContent>
              </Popover>
            )}
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl">{logo}</div>
                <span className="hidden font-bold text-xl sm:inline-block">
                  Enigma
                </span>
              </button>
              {/* Navigation menu */}
              {!isMobile && (
                <NavigationMenu className="flex">
                  <NavigationMenuList className="gap-1">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index}>
                        <button
                          onClick={(e) => navScroll(e, link)}
                          className={cn(
                            "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer no-underline",
                            (() => {
                              const [linkPath, linkHash] = link.href.split('#');
                              const normalizedLinkPath = linkPath || '/';
                              const currentHash = location.hash || '';
                              if (linkHash) {
                                return (location.pathname === normalizedLinkPath && currentHash === `#${linkHash}`)
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground/80 hover:text-foreground";
                              }
                              return (location.pathname === normalizedLinkPath && currentHash === '')
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground/80 hover:text-foreground";
                            })(),
                          )}
                        >
                          {link.label}
                        </button>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              )}
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Avatar>
                  {user.photoURL ? (
                    <img src={user.photoURL} />
                  ) : (
                    <AvatarFallback>
                      {user.displayName ? user.displayName[0] : "?"}
                    </AvatarFallback>
                  )}
                </Avatar>

                <Button onClick={handleLogout} variant="destructive">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={handleGoogleSignIn} variant="default">
                Sign In
              </Button>
            )}
            <ModeToggle />
          </div>
        </div>
      </header>
    );
  },
);

Navbar01.displayName = "Navbar01";

export { Logo, HamburgerIcon };
