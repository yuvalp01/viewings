import { HomeIcon, PlusIcon, CurrencyDollarIcon } from "@/app/components/icons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 font-sans dark:from-black dark:via-zinc-950 dark:to-black">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            Apartment Viewing
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-8">
          {/* Viewings Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/20"></div>
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  <HomeIcon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
                  Viewings
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/viewings"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-95"
                >
                  View All
                </Link>
                <Link
                  href="/viewings/new"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  New
                </Link>
              </div>
            </div>
          </div>

          {/* Viewing Extras Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-purple-950/20"></div>
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  <CurrencyDollarIcon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-black dark:text-zinc-50">
                  Viewing Extras
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/viewing-extras"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-purple-800 hover:shadow-lg active:scale-95"
                >
                  Manage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
