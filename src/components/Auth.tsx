import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";

const provider = new GoogleAuthProvider();

export default function Login({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLogin) onLogin();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Login failed.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (onLogin) onLogin();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Registration failed.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, provider);
      if (onLogin) onLogin();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Google login failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#222326]">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-[#CC0000] text-center">
          {isRegistering ? "Create Account" : "Login"}
        </h2>
        <form
          onSubmit={isRegistering ? handleRegister : handleEmailLogin}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Email"
            className="px-3 py-2 rounded border border-[#CC0000] focus:outline-none text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="px-3 py-2 rounded border border-[#CC0000] focus:outline-none text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="bg-[#CC0000] text-white font-bold py-2 rounded hover:bg-[#a30000] transition"
          >
            {isRegistering ? "Create Account" : "Login with Email"}
          </button>
        </form>
        <div className="my-2 text-center">
          <button
            className="text-[#CC0000] underline text-sm"
            onClick={() => setIsRegistering((v) => !v)}
            type="button"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Create one"}
          </button>
        </div>
        <div className="my-4 text-center text-gray-500">or</div>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
