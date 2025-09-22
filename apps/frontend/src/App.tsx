// frontend/src/App.tsx
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import { useLoading } from "./context/LoadingContext";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import AppRouter from "./router";

function AppContent() {
  const { isLoading } = useLoading();
  const { loading: authLoading } = useAuth();

  // show loading if either auth is still resolving OR route transition is happening
  if (isLoading || authLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  return <AppRouter />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
