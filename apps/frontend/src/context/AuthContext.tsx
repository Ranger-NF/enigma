import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { createOrUpdateUser, getUserProgress } from '../services/firestoreService';

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

	const refreshUserProgress = async () => {
		if (user) {
			try {
				const progress = await getUserProgress(user.uid);
				setUserProgress(progress);
			} catch (error) {
				console.error('Error fetching user progress:', error);
			}
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user);
			
			if (user) {
				// Create or update user profile in Firestore
				try {
					await createOrUpdateUser(user.uid, {
						name: user.displayName || '',
						email: user.email || ''
					});
					
					// Fetch user progress
					const progress = await getUserProgress(user.uid);
					setUserProgress(progress);
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
