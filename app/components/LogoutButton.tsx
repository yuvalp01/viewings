"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-lg border-2 border-zinc-300 bg-white px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-zinc-700 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
      title="Logout"
    >
      <svg
        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}

