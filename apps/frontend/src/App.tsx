// frontend/src/App.tsx
import AppRouter from "./router";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";

function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<AuthProvider>
				<AppRouter />
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;
