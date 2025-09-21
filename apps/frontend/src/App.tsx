// frontend/src/App.tsx
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import { useLoading } from './context/LoadingContext';
import { LoadingScreen } from './components/ui/LoadingScreen';
import AppRouter from './router';

function App() {
	const { isLoading } = useLoading();
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<AuthProvider>
				<LoadingScreen isLoading={isLoading} />
				<AppRouter />
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
