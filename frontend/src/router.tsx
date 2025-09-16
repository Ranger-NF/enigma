// frontend/src/router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/Home";
import SignInPage from "./pages/SignInPage";
import PlayPage from "./pages/PlayPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import Rules from "./pages/Rules";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<WelcomePage />} />
				<Route path="/signin" element={<SignInPage />} />
				<Route
					path="/play"
					element={
						<ProtectedRoute>
							<PlayPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/leaderboard"
					element={
						<ProtectedRoute>
							<LeaderboardPage />
						</ProtectedRoute>
					}
				/>
				<Route path="/rules" element={<Rules />} />
			</Routes>
		</BrowserRouter>
	);
}
