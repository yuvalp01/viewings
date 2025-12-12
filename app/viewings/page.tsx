import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Button from "@/app/components/Button";
import { PlusIcon, HomeIcon, CalendarCheckIcon } from "@/app/components/icons";
import RefreshButton from "./components/RefreshButton";
import ScheduledVisitsFilter from "./components/ScheduledVisitsFilter";
import ViewingsTable from "./components/ViewingsTable";

export const dynamic = 'force-dynamic';

interface ViewingsPageProps {
  searchParams: Promise<{ filter?: string }> | { filter?: string };
}

export default async function ViewingsPage(props: ViewingsPageProps) {
  // Handle both Promise and direct object for searchParams (Next.js compatibility)
  const searchParams = await Promise.resolve(props.searchParams);
  
  // Calculate date threshold: 7 days ago from now
  // Use local time to match user's timezone expectations
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  // Set to start of day (midnight) for consistent comparison
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Build where clause based on filter
  const whereClause: any = {
    isDeleted: false,
  };

  // Apply filter if "scheduled" filter is active
  if (searchParams?.filter === "scheduled") {
    whereClause.viewingDate = {
      not: null,
      gte: sevenDaysAgo,
    };
  }

  const viewings = await prisma.viewing.findMany({
    where: whereClause,
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
      type: 5,
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

  const scheduleStakeholders = await prisma.stakeholder.findMany({
    where: {
      type: {
        gte: 10,
      },
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

  const qualityLevels = await prisma.qualityLevel.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Serialize Decimal values to numbers for client component
  // Prisma Decimal objects cannot be passed to Client Components
  const serializedViewings = viewings.map((viewing: any) => {
    let viewingDateStr = null;
    if (viewing.viewingDate) {
      if (viewing.viewingDate instanceof Date) {
        // Format as YYYY-MM-DDTHH:mm:ss without timezone conversion
        // Extract UTC components to preserve the exact stored time
        const year = viewing.viewingDate.getUTCFullYear();
        const month = String(viewing.viewingDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(viewing.viewingDate.getUTCDate()).padStart(2, '0');
        const hours = String(viewing.viewingDate.getUTCHours()).padStart(2, '0');
        const minutes = String(viewing.viewingDate.getUTCMinutes()).padStart(2, '0');
        const seconds = String(viewing.viewingDate.getUTCSeconds()).padStart(2, '0');
        viewingDateStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      } else {
        viewingDateStr = viewing.viewingDate;
      }
    }
    return {
      ...viewing,
      size: viewing.size ? Number(viewing.size) : null,
      price: viewing.price ? Number(viewing.price) : null,
      bedrooms: viewing.bedrooms ? Number(viewing.bedrooms) : null,
      floor: viewing.floor ? Number(viewing.floor) : null,
      viewingDate: viewingDateStr,
      viewedByStakeholderId: viewing.viewedByStakeholderId ?? null,
      // Visit details fields
      isSecurityDoor: viewing.isSecurityDoor ?? null,
      buildingSecurityDoorsPercent: viewing.buildingSecurityDoorsPercent ?? null,
      aluminumWindowsLevel: viewing.aluminumWindowsLevel ?? null,
      renovationKitchenLevel: viewing.renovationKitchenLevel ?? null,
      renovationBathroomLevel: viewing.renovationBathroomLevel ?? null,
      renovationLevel: viewing.renovationLevel ?? null,
      viewLevel: viewing.viewLevel ?? null,
      balconyLevel: viewing.balconyLevel ?? null,
      buildingLobbyLevel: viewing.buildingLobbyLevel ?? null,
      buildingMaintenanceLevel: viewing.buildingMaintenanceLevel ?? null,
      expectedMinimalRent: viewing.expectedMinimalRent ? Number(viewing.expectedMinimalRent) : null,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Viewings
            </h1>
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              {searchParams?.filter === "scheduled" 
                ? "Showing scheduled visits (past week and future)"
                : "View all viewing records"}
            </p>
          </div>
          <div className="flex gap-4">
            <Suspense fallback={<div className="w-12 h-12" />}>
              <ScheduledVisitsFilter />
            </Suspense>
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
          <ViewingsTable viewings={serializedViewings} stakeholders={stakeholders} scheduleStakeholders={scheduleStakeholders} qualityLevels={qualityLevels} />
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Showing {viewings.length} viewing
            {viewings.length !== 1 ? "s" : ""}
          </span>
          {searchParams?.filter === "scheduled" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              <CalendarCheckIcon className="h-3 w-3" />
              Filtered
            </span>
          )}
        </div>
      </main>
    </div>
  );
}
