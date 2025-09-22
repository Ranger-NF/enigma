import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/ui/LoadingScreen';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }

  return user ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;