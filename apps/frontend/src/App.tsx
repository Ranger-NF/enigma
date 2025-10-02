// frontend/src/App.tsx
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import AppRouter from "./router";

function AppContent() {
  const { loading: authLoading } = useAuth();

  // show loading only for auth loading, not for route transitions
  if (authLoading) {
    return <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-primary animate-spin"></div>
        <div className="mt-4 text-center text-lg font-semibold text-primary">
          Loading...
        </div>
      </div>
    </div>;
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
