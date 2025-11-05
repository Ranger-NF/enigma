import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	userProgress: any | null;
	refreshUserProgress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	userProgress: null,
	refreshUserProgress: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [userProgress, setUserProgress] = useState<any | null>(null);

	const BACKEND_URL = import.meta.env.VITE_BACKEND_SERVER_URL || 'http://localhost:5000';

	const createOrUpdateUserProfile = async (user: User) => {
		try {
			const token = await user.getIdToken();
			const response = await fetch(`${BACKEND_URL}/user/profile`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					name: user.displayName || '',
					email: user.email || ''
				})
			});

			if (!response.ok) {
				throw new Error(`Failed to create/update user: ${response.statusText}`);
			}
		} catch (error) {
			console.error('Error creating/updating user profile:', error);
			throw error;
		}
	};

	const fetchUserProgress = async (user: User) => {
		try {
			const token = await user.getIdToken();
			const response = await fetch(`${BACKEND_URL}/user/progress`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch user progress: ${response.statusText}`);
			}

			const data = await response.json();
			setUserProgress(data.user);
		} catch (error) {
			console.error('Error fetching user progress:', error);
			throw error;
		}
	};

	const refreshUserProgress = async () => {
		if (user) {
			try {
				await fetchUserProgress(user);
			} catch (error) {
				console.error('Error refreshing user progress:', error);
			}
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user);

			if (user) {
				// Create or update user profile via backend API
				try {
					await createOrUpdateUserProfile(user);

					// Fetch user progress via backend API
					await fetchUserProgress(user);
				} catch (error) {
					console.error('Error setting up user:', error);
				}
			} else {
				setUserProgress(null);
			}

			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, userProgress, refreshUserProgress }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
