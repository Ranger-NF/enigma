import { ThemeProvider } from "./components/theme-provider";
import { LoadingProvider } from './context/LoadingContext';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <LoadingProvider>
          <AppRouter />
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
