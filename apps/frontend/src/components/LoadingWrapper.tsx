import { useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { useLocation } from 'react-router-dom';
import { LoadingScreen } from './ui/LoadingScreen';

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, setIsLoading } = useLoading();
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname, setIsLoading]);

  return (
    <>
      {isLoading && <LoadingScreen isLoading={isLoading} />}
      {children}
    </>
  );
}
