import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";
import LandingLayout from "./components/LandingLayout";
import { LoadingWrapper } from './components/LoadingWrapper';

// Lazy load pages for code splitting and improved initial load time
const HomePage = lazy(() => import("./pages/HomePage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const Rules = lazy(() => import("./pages/Rules"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">Loading...</div>
  </div>
);

function AppRouter() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <LoadingWrapper>
          <LandingLayout />
        </LoadingWrapper>
      ),
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          )
        },
        {
          path: '/rules',
          element: (
            <Suspense fallback={<PageLoader />}>
              <Rules />
            </Suspense>
          ),
          handle: { noScroll: true }
        },
        {
          path: '/about-us',
          element: (
            <Suspense fallback={<PageLoader />}>
              <AboutUs />
            </Suspense>
          )
        },
        {
          path: '/signin',
          element: (
            <Suspense fallback={<PageLoader />}>
              <SignInPage />
            </Suspense>
          )
        },
        {
          path: '/play',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PlayPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: '/leaderboard',
          element: (
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <LeaderboardPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppRouter;
