import Button from "@/app/components/Button";
import { ListIcon, HomeIcon, PlusIcon, CurrencyDollarIcon } from "@/app/components/icons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            Apartment Viewing Management
          </h1>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Viewings Card */}
          <div className="group rounded-lg border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-[#383838] dark:group-hover:bg-[#ccc]">
                <HomeIcon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                Viewings
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/viewings"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                View All Viewings
              </Link>
              <Link
                href="/viewings/new"
                className="inline-flex items-center gap-2 rounded-full border border-solid border-black/[.08] px-4 py-2 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                <PlusIcon className="h-4 w-4" />
                New Viewing
              </Link>
            </div>
          </div>

          {/* Apartments Card */}
          <div className="group rounded-lg border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-[#383838] dark:group-hover:bg-[#ccc]">
                <ListIcon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                Apartments
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/apartments"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                View All Apartments
              </Link>
            </div>
          </div>

          {/* Viewing Extras Card */}
          <div className="group rounded-lg border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-[#383838] dark:group-hover:bg-[#ccc]">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
                Viewing Extras
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/viewing-extras"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                Manage Extras
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 border-t border-zinc-200 pt-12 dark:border-zinc-800">
          <h3 className="mb-6 text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button
              href="/viewings/new"
              icon={<PlusIcon className="h-5 w-5" />}
              tooltip="Create a new viewing"
            />
            <Button
              href="/viewings"
              variant="secondary"
              icon={<HomeIcon className="h-5 w-5" />}
              tooltip="View all viewings"
            />
            <Button
              href="/apartments"
              variant="secondary"
              icon={<ListIcon className="h-5 w-5" />}
              tooltip="View all apartments"
            />
            <Button
              href="/viewing-extras"
              variant="secondary"
              icon={<CurrencyDollarIcon className="h-5 w-5" />}
              tooltip="Manage viewing extras"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
