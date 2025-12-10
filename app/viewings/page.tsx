import { prisma } from "@/lib/prisma";
import Button from "@/app/components/Button";
import { PlusIcon, HomeIcon } from "@/app/components/icons";
import RefreshButton from "./components/RefreshButton";
import ViewingsTable from "./components/ViewingsTable";

export default async function ViewingsPage() {
  const viewings = await prisma.viewing.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      id: "desc",
    },
    include: {
      agentStakeholder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const stakeholders = await prisma.stakeholder.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Serialize Decimal values to numbers for client component
  // Prisma Decimal objects cannot be passed to Client Components
  const serializedViewings = viewings.map((viewing: typeof viewings[0]) => ({
    ...viewing,
    size: viewing.size ? Number(viewing.size) : null,
    price: viewing.price ? Number(viewing.price) : null,
    bedrooms: viewing.bedrooms ? Number(viewing.bedrooms) : null,
    floor: viewing.floor ? Number(viewing.floor) : null,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Viewings
            </h1>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              View all viewing records
            </p>
          </div>
          <div className="flex gap-4">
            <RefreshButton />
            <Button
              href="/viewings/new"
              icon={<PlusIcon className="h-5 w-5" />}
              tooltip="Create a new viewing"
            />
            <Button
              href="/"
              variant="secondary"
              icon={<HomeIcon className="h-5 w-5" />}
              tooltip="Return to home page"
            />
          </div>
        </div>

        {viewings.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              No viewings found.
            </p>
            <Button
              href="/viewings/new"
              icon={<PlusIcon className="h-5 w-5" />}
              tooltip="Create your first viewing"
              className="mt-4"
            />
          </div>
        ) : (
          <ViewingsTable viewings={serializedViewings} stakeholders={stakeholders} />
        )}

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Showing {viewings.length} viewing
          {viewings.length !== 1 ? "s" : ""}
        </div>
      </main>
    </div>
  );
}
