"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "./icons";

export default function TopMenuNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <Link
        href="/"
        className={`flex items-center gap-1 rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors ${
          pathname === "/"
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`}
      >
        <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      <Link
        href="/viewings"
        className={`rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors ${
          pathname === "/viewings"
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`}
      >
        Viewings
      </Link>
      <Link
        href="/viewing-extras"
        className={`rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors ${
          pathname === "/viewing-extras"
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`}
      >
        Extras
      </Link>
    </div>
  );
}
