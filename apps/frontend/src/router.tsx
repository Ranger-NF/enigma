import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import PlayPage from "./pages/PlayPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import Rules from "./pages/Rules";
import AboutUs from "@/pages/AboutUs";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingLayout from "./components/LandingLayout";
import { LoadingWrapper } from './components/LoadingWrapper';

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
          element: <HomePage />
        },
        { 
          path: '/rules', 
          element: <Rules />,
          handle: { noScroll: true }
        },
        { 
          path: '/about-us', 
          element: <AboutUs />
        },
        { 
          path: '/signin', 
          element: <SignInPage />
        },
        {
          path: '/play',
          element: (
            <ProtectedRoute>
              <PlayPage />
            </ProtectedRoute>
          ),
        },
        {
          path: '/leaderboard',
          element: (
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppRouter;
