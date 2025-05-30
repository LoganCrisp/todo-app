import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const provider = new GoogleAuthProvider();

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Login failed.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Save username in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        email: email,
      });
      router.push("/");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Registration failed.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user doc exists, if not create it
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Use Google displayName, fallback to email prefix
        const username =
          user.displayName || (user.email ? user.email.split("@")[0] : "User");
        await setDoc(userRef, {
          username,
          email: user.email || "",
        });
      }
      router.push("/");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Google login failed.");
    }
  };

  return (
    <div className="flex flex-col items-center px-2 py-30">
      {/* Auth Card */}
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-5 text-[#CC0000] text-center">
          {isRegistering ? "Create Account" : "Login"}
        </h2>
        <form
          onSubmit={isRegistering ? handleRegister : handleEmailLogin}
          className="flex flex-col gap-5"
        >
          {isRegistering && (
            <input
              type="text"
              placeholder="Username"
              className="px-4 py-3 rounded-xl border border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000] text-black text-base font-semibold transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-xl border border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000] text-black text-base font-semibold transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus={!isRegistering}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-xl border border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000] text-black text-base font-semibold transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <div className="text-red-600 text-center text-sm font-medium -mt-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="bg-[#CC0000] text-white font-bold py-3 rounded-xl hover:bg-[#a30000] transition text-lg mt-1"
          >
            {isRegistering ? "Create Account" : "Login with Email"}
          </button>
        </form>
        <div className="my-2 text-center">
          <button
            className="text-[#CC0000] underline text-sm font-semibold hover:text-[#a30000] transition"
            onClick={() => {
              setIsRegistering((v) => !v);
              setUsername("");
            }}
            type="button"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Create one"}
          </button>
        </div>
        <div className="flex items-center my-5 gap-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="text-gray-400 font-bold text-sm">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition text-lg shadow"
        >
          <svg viewBox="0 0 32 32" width="24" height="24">
            <g>
              <path fill="#fff" d="M0 0h32v32H0z" fillOpacity="0" />
              <path
                d="M16 13v5h8.2c-.33 2-2.07 5.05-8.2 5.05-4.93 0-8.95-4.1-8.95-9.05s4.02-9.05 8.95-9.05c2.81 0 4.7 1.11 5.78 2.05l3.95-3.85C23.06 1.91 19.86 0 16 0 7.16 0 0 7.16 0 16s7.16 16 16 16c8.4 0 14.74-6.53 14.74-14.86 0-.99-.11-1.7-.25-2.44H16z"
                fill="#fbbc05"
              />
              <path
                d="M16 32c4.32 0 7.94-1.42 10.58-3.87l-5.06-4.14c-1.42 1-3.32 1.73-5.52 1.73-4.25 0-7.84-2.87-9.13-6.7l-5.25 4.05C5.2 28.54 10.14 32 16 32z"
                fill="#34a853"
              />
              <path
                d="M6.85 19.02A8.98 8.98 0 0 1 6.14 16c0-1.04.18-2.05.48-3.02L1.33 8.93A15.98 15.98 0 0 0 0 16c0 2.65.64 5.16 1.77 7.36l5.08-4.34z"
                fill="#fbbc05"
              />
              <path
                d="M32 16c0-1.09-.09-2.15-.27-3.16H16v6.16h8.92c-.38 2.17-1.94 4.01-4.02 5.07l5.03 3.92C29.36 25.27 32 20.91 32 16z"
                fill="#4285f4"
              />
              <path
                d="M16 6.22c2.32 0 4.12.8 5.4 2.12l4.06-3.95C23.94 2.61 20.25 1.05 16 1.05 10.14 1.05 5.2 4.98 3.18 10.13l5.13 4.02C8.17 9.08 11.75 6.22 16 6.22z"
                fill="#ea4335"
              />
            </g>
          </svg>
          Login with Google
        </button>
      </div>
    </div>
  );
}
