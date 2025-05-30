"use client";
import Link from "next/link";
import { useState } from "react";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../firebase";

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This cannot be undone!"
      )
    ) {
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
          alert("Account deleted.");
        } catch (err: unknown) {
          if (err instanceof Error) {
            alert("Error deleting account: " + err.message);
          } else {
            alert("Error deleting account.");
          }
        }
      }
    }
  };

  return (
    <header className="w-full flex justify-center items-center bg-[#222326] py-6 relative">
      {/* Burger icon left */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
          className="p-2 rounded bg-[#222326] hover:bg-[#18191c] focus:outline-none"
        >
          {/* Hamburger SVG */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect y="4" width="24" height="2" rx="1" fill="#CC0000" />
            <rect y="11" width="24" height="2" rx="1" fill="#CC0000" />
            <rect y="18" width="24" height="2" rx="1" fill="#CC0000" />
          </svg>
        </button>
        {/* Dropdown Menu */}
        {open && (
          <div className="absolute mt-2 left-0 w-52 rounded shadow-lg bg-white border border-[#eee] py-2 flex flex-col z-50">
            <Link
              href="/"
              className="px-4 py-2 hover:bg-gray-100 text-[#CC0000] font-semibold"
              onClick={() => setOpen(false)}
            >
              Active Tasks
            </Link>
            <Link
              href="/completed"
              className="px-4 py-2 hover:bg-gray-100 text-[#CC0000] font-semibold"
              onClick={() => setOpen(false)}
            >
              Completed Tasks
            </Link>
            <button
              className="px-4 py-2 text-left hover:bg-gray-100 text-[#CC0000] font-semibold"
              onClick={() => {
                setOpen(false);
                signOut(auth);
              }}
            >
              Sign Out
            </button>
            <button
              className="px-4 py-2 text-left hover:bg-red-100 text-red-700 font-semibold"
              onClick={() => {
                setOpen(false);
                handleDeleteAccount();
              }}
            >
              Delete Account
            </button>
          </div>
        )}
      </div>
      {/* Logo and Brand Center */}
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center bg-[#CC0000] rounded-full p-2 shadow-lg">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 30L20 16H14L20 2"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#CC0000] select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.10)]">
          wut<span className="text-white">TODO</span>
        </span>
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-lg font-semibold select-none tracking-wide opacity-80">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
    </header>
  );
}
