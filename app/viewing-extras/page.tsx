import { prisma } from "@/lib/prisma";
import Button from "@/app/components/Button";
import { HomeIcon } from "@/app/components/icons";
import ViewingExtrasTable from "./components/ViewingExtrasTable";

export const dynamic = 'force-dynamic';

export default async function ViewingExtrasPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Viewing Extras
            </h1>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              Manage expense types and their default descriptions and estimations
            </p>
          </div>
          <Button
            href="/"
            variant="secondary"
            icon={<HomeIcon className="h-5 w-5" />}
            tooltip="Return to home page"
          />
        </div>

        <ViewingExtrasTable />
      </main>
    </div>
  );
}


