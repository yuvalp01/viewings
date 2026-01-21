import { prisma } from "@/lib/prisma";
import Button from "@/app/components/Button";
import { HomeIcon } from "@/app/components/icons";
import UserHeader from "@/app/components/UserHeader";
import ViewingExtrasTable from "./components/ViewingExtrasTable";

export const dynamic = 'force-dynamic';

export default async function ViewingExtrasPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="mb-4 md:mb-0 md:flex md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                Viewing Extras
              </h1>
              <p className="mt-2 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
                Manage expense types and their default descriptions and estimations
              </p>
            </div>
            
            {/* Actions Section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="w-full sm:w-auto">
                <Button
                  href="/"
                  variant="secondary"
                  icon={<HomeIcon className="h-5 w-5" />}
                  tooltip="Return to home page"
                />
              </div>
              <div className="w-full sm:w-auto">
                <UserHeader />
              </div>
            </div>
          </div>
        </div>

        <ViewingExtrasTable />
      </main>
    </div>
  );
}






