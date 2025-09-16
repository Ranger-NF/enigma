import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {

	const { user } = useAuth();

	const handleApiCall = async () => {
		try {
			const idToken = await user?.getIdToken();
			const response = await fetch('http://localhost:5000/api/protected', {
				headers: {
					Authorization: `Bearer ${idToken}`,
				},
			});
			const data = await response.json();
			console.log(data);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<div className="relative w-full">
				<Navbar01 />
				<div className="flex flex-col items-center justify-center min-h-screen gap-4">
					{
						user ? (<>
							<h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
							<Button onClick={handleApiCall} variant="destructive">
								Test protected route api call
							</Button>
						</>

						) : (
							<h1 className="text-2xl font-bold">Welcome to Enigma</h1>
						)
					}
				</div>
			</div >
		</>
	);
}
