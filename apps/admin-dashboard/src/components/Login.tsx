import { useState } from "react";
import { loginWithGoogle } from "../lib/auth";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold text-white">Enigma Admin Login</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Sign in with Google
      </button>
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
}
