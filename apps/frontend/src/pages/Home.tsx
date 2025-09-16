import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01';

export default function WelcomePage() {
	const { user, login, logout } = useAuth();

	return (
		<>
			<div className="relative w-full">
				<Navbar01 />
				<div className="flex flex-col items-center justify-center min-h-screen gap-4">
					<h1 className="text-2xl font-bold">Welcome to Enigma</h1>
					<p>Landing page</p>

					<div className="flex flex-col gap-2">
						{!user ? (
							<Button onClick={login} variant="default">
								Sign In
							</Button>
						) : (
							<div className="flex flex-col items-center gap-2">
								<p className="text-sm text-green-600">Logged in as: {user}</p>
								<Button onClick={logout} variant="destructive">
									Sign Out
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

// Will contain:
// - Welcome message
// - Conditional rendering of Sign In button / Profile section based on auth state
// - Navigation to Play page after sign in
