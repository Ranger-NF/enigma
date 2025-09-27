import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { getCurrentDay } from '../services/firestoreService';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundPng from '../assets/background.png';
import potactorImage from '../assets/bg-section-2.png';

export default function WelcomePage() {
	const navigate = useNavigate();
	const { user, userProgress } = useAuth();
	const [currentDay, setCurrentDay] = useState(1);
	const [completedDays, setCompletedDays] = useState(0);

	useEffect(() => {
		const day = getCurrentDay();
		setCurrentDay(day);

		if (userProgress?.completed) {
			const completed = Object.values(userProgress.completed).filter(
				(day: any) => day.done
			).length;
			setCompletedDays(completed);
		}
	}, [userProgress]);

	const navLinks = [
		{ href: '/', label: 'Home', active: true },
		{ href: '/rules', label: 'Rules' },
		{ href: '/leaderboard', label: 'Leaderboard' },
		{ href: '/play', label: 'Play' },
	];

	return (
		<div className="relative w-full min-h-screen bg-background">
			<Navbar01 navigationLinks={navLinks} />

			<div className="container mx-auto py-12">
				{/* Hero Section */}
				<section className='relative h-screen'>
					<img
						src={backgroundPng}
						alt="Background"
						className="absolute bottom-[20%] left-[25%] h-[600px] w-[600px] z-[-0.2] opacity-60"
						
					/>
					<div className="relative top-[19%] z-10 text-center mb-16">
						<h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
							ENIGMA
						</h1>
						<p className="text-lg md:text-xl text-white mb-8 max-w-3xl mx-auto">
							Join our 10-day treasure hunt! One question per day, compete for the
							fastest completion time, and climb the daily leaderboard.
						</p>

						{user ? (
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									onClick={() => navigate('/play')}
									className="px-8 py-4 text-lg transition-transform duration-200 hover:scale-105 active:scale-95"
								>
									Start Today's Challenge
								</Button>
								<Button
									onClick={() => navigate('/leaderboard')}
									variant="outline"
									className="px-8 py-4 text-lg"
								>
									View Leaderboard
								</Button>
							</div>
						) : (
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									onClick={() => (window.location.href = '/signin')}
									className="px-8 py-4 text-lg"
								>
									Sign In to Play
								</Button>
								<Button
									onClick={() => (window.location.href = '/rules')}
									variant="outline"
									className="px-8 py-4 text-lg"
								>
									Read Rules
								</Button>
							</div>
						)}
					</div>
				</section>
				<section>
					<img
						src={potactorImage}
						alt="Background"
						className="absolute right-[0] h-[800px]"
						
					/>
					{/* Progress Section */}
					{user && (
						<div className="relative bg-card border z-10 rounded-lg p-8 mb-12">
							<h2 className="text-2xl font-bold text-foreground mb-6 text-center">
								Your Progress
							</h2>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-primary">
										{completedDays}
									</div>
									<div className="text-muted-foreground">Days Completed</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-bold text-primary">
										Day {currentDay}
									</div>
									<div className="text-muted-foreground">Current Day</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-bold text-primary">
										{10 - completedDays}
									</div>
									<div className="text-muted-foreground">Days Remaining</div>
								</div>
							</div>

							{/* Progress Bar */}
							<div className="w-full bg-muted rounded-full h-3 mb-4">
								<div
									className="bg-primary h-3 rounded-full transition-all duration-500"
									style={{ width: `${(completedDays / 10) * 100}%` }}
								></div>
							</div>
							<p className="text-center text-muted-foreground">
								{completedDays}/10 challenges completed (
								{Math.round((completedDays / 10) * 100)}%)
							</p>
						</div>
					)}
					{/* Features Grid */}
					<div className="relative z-0 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
						<div className="bg-card border rounded-lg p-6 text-center">
							<div className="text-4xl mb-4">📅</div>
							<h3 className="text-xl font-bold text-foreground mb-2">
								Daily Challenges
							</h3>
							<p className="text-muted-foreground">
								One new question unlocks each day for 10 days. Complete them as
								fast as possible!
							</p>
						</div>

						<div className="bg-card border rounded-lg p-6 text-center">
							<div className="text-4xl mb-4">🏆</div>
							<h3 className="text-xl font-bold text-foreground mb-2">
								Live Leaderboard
							</h3>
							<p className="text-muted-foreground">
								Compete with others! The leaderboard resets daily based on
								completion speed.
							</p>
						</div>

						<div className="bg-card border rounded-lg p-6 text-center">
							<div className="text-4xl mb-4">📈</div>
							<h3 className="text-xl font-bold text-foreground mb-2">
								Track Progress
							</h3>
							<p className="text-muted-foreground">
								Monitor your daily progress and see how you rank against other
								participants.
							</p>
						</div>
					</div>

					{/* How It Works */}
					<div className="relative bg-card border rounded-lg p-8">
						<h2 className="text-2xl font-bold text-foreground mb-6 text-center">
							How It Works
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<div className="text-center">
								<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
									1
								</div>
								<h3 className="font-semibold text-foreground mb-2">Sign In</h3>
								<p className="text-sm text-muted-foreground">
									Create an account or sign in with Google
								</p>
							</div>

							<div className="text-center">
								<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
									2
								</div>
								<h3 className="font-semibold text-foreground mb-2">
									Daily Question
								</h3>
								<p className="text-sm text-muted-foreground">
									Answer today's challenge as quickly as possible
								</p>
							</div>

							<div className="text-center">
								<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
									3
								</div>
								<h3 className="font-semibold text-foreground mb-2">Compete</h3>
								<p className="text-sm text-muted-foreground">
									See your ranking on the daily leaderboard
								</p>
							</div>

							<div className="text-center">
								<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
									4
								</div>
								<h3 className="font-semibold text-foreground mb-2">Repeat</h3>
								<p className="text-sm text-muted-foreground">
									Come back tomorrow for the next challenge!
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
