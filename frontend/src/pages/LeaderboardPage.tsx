import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";

// Imports will go here
// - React
// - Leaderboard components
// - Auth context (optional, for showing user's position)
// frontend/src/pages/LeaderboardPage.tsx
export default function LeaderboardPage() {
	const navLinks: Navbar01NavLink[] = [
		{ href: '/', label: 'Home' },
		{ href: '/rules', label: 'Rules' },
		{ href: '/leaderboard', label: 'Leaderboard', active: true },
		{ href: '/', label: 'Contact' },
	];
	return (
		<div className="relative w-full">
			<Navbar01 navigationLinks={navLinks} />
			<div className="flex flex-col items-center justify-center min-h-screen">
				<h1 className="text-2xl font-bold">Leaderboard</h1>
				<p className="text-gray-600">Scores will show here</p>
			</div>
		</div>
	);
}

// Will contain:
// - Leaderboard display
// - Scoring information
// - Navigation back to play
