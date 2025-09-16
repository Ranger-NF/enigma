// frontend/src/components/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    // If not logged in, redirect to Sign In
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
