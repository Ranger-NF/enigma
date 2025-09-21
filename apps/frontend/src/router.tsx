import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, type JSX } from "react";
import { useLoading } from "./context/LoadingContext";
import WelcomePage from "./pages/Home";
import SignInPage from "./pages/SignInPage";
import PlayPage from "./pages/PlayPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import Rules from "./pages/Rules";
import ProtectedRoute from "./components/ProtectedRoute";

function RouteWithLoading({ element }: { element: JSX.Element }) {
	const { setIsLoading } = useLoading();
	const location = useLocation();

	useEffect(() => {
		setIsLoading(true);
		const timer = setTimeout(() => setIsLoading(false), 800);
		return () => clearTimeout(timer);
	}, [location.pathname, setIsLoading]);

	return element;
}

export default function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<RouteWithLoading element={<WelcomePage />} />} />
				<Route path="/signin" element={<SignInPage />} />
				<Route element={<ProtectedRoute />}>
					<Route path="/play" element={<RouteWithLoading element={<PlayPage />} />} />
				</Route>

				<Route element={<ProtectedRoute />}>
					<Route
						path="/leaderboard"
						element={<RouteWithLoading element={<LeaderboardPage />} />}
					/>
				</Route>

				<Route path="/rules" element={<Rules />} />
			</Routes>
		</BrowserRouter>
	);
}
