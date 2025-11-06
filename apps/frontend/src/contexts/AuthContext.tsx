import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface UserProgress {
  completed: {
    [key: string]: {
      done: boolean;
      timestamp?: number;
      // Add other properties if they exist in your userProgress.completed objects
    };
  };
  // Add other top-level userProgress properties here if they exist
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  userProgress: UserProgress | null;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  // auth is already imported from firebase.ts

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Add additional scopes here if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      // More specific error messages
      if (errorCode === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completing the sign-in process.');
      } else if (errorCode === 'auth/cancelled-popup-request') {
        throw new Error('Only one sign-in request can be made at a time.');
      } else if (errorCode === 'auth/popup-blocked') {
        throw new Error('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (errorCode === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for sign-in. Please contact support.');
      } else {
        throw new Error(`Failed to sign in with Google: ${errorMessage}`);
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error signing out:", error);
      }
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []); // auth is stable, no need to include in deps

  const value = {
    currentUser,
    userProgress,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
