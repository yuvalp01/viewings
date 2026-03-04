import { prisma } from "@/lib/prisma";
import Button from "@/app/components/Button";
import { PlusIcon, CalendarCheckIcon } from "@/app/components/icons";
import ViewingsTable from "./components/ViewingsTable";
import ViewingsFilterPanel from "./components/ViewingsFilterPanel";

export const dynamic = 'force-dynamic';

interface ViewingsPageProps {
  searchParams:
    | Promise<{
        filter?: string;
        showArchived?: string;
        outcomeStatusIds?: string;
        priceMin?: string;
        priceMax?: string;
        sizeMin?: string;
        sizeMax?: string;
      }>
    | {
        filter?: string;
        showArchived?: string;
        outcomeStatusIds?: string;
        priceMin?: string;
        priceMax?: string;
        sizeMin?: string;
        sizeMax?: string;
      };
}

export default async function ViewingsPage(props: ViewingsPageProps) {
  // Handle both Promise and direct object for searchParams (Next.js compatibility)
  const searchParams = await Promise.resolve(props.searchParams);
  
  // Calculate today's date range (start and end of today)
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Build where clause based on filter
  const whereClause: any = {
    isDeleted: false,
  };

  // Exclude archived items by default (unless showArchived is true)
  const showArchived = searchParams?.showArchived === "true";
  if (!showArchived) {
    whereClause.isArchive = false;
  }

  // Apply price range filter
  const priceMinRaw = searchParams?.priceMin;
  const priceMaxRaw = searchParams?.priceMax;
  const priceMin = priceMinRaw !== undefined ? Number(priceMinRaw) : undefined;
  const priceMax = priceMaxRaw !== undefined ? Number(priceMaxRaw) : undefined;

  if (!Number.isNaN(priceMin) && priceMin !== undefined) {
    whereClause.price = whereClause.price ?? {};
    whereClause.price.gte = priceMin;
  }
  if (!Number.isNaN(priceMax) && priceMax !== undefined) {
    whereClause.price = whereClause.price ?? {};
    whereClause.price.lte = priceMax;
  }

  // Apply size range filter
  const sizeMinRaw = searchParams?.sizeMin;
  const sizeMaxRaw = searchParams?.sizeMax;
  const sizeMin = sizeMinRaw !== undefined ? Number(sizeMinRaw) : undefined;
  const sizeMax = sizeMaxRaw !== undefined ? Number(sizeMaxRaw) : undefined;

  if (!Number.isNaN(sizeMin) && sizeMin !== undefined) {
    whereClause.size = whereClause.size ?? {};
    whereClause.size.gte = sizeMin;
  }
  if (!Number.isNaN(sizeMax) && sizeMax !== undefined) {
    whereClause.size = whereClause.size ?? {};
    whereClause.size.lte = sizeMax;
  }

  // Apply outcome status filter (multi-select via comma-separated ids in outcomeStatusIds)
  const outcomeStatusIdsParam = searchParams?.outcomeStatusIds;
  let outcomeStatusFilterIds: number[] | null = null;

  if (outcomeStatusIdsParam === "none") {
    // User explicitly chose "no outcome filter" (e.g. via Clear all)
    outcomeStatusFilterIds = null;
  } else if (outcomeStatusIdsParam && outcomeStatusIdsParam.trim() !== "") {
    // Explicit selection from URL
    const parsed = outcomeStatusIdsParam
      .split(",")
      .map((value) => parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value));

    outcomeStatusFilterIds = parsed.length > 0 ? parsed : null;
  } else {
    // No explicit param → apply default 1–4
    outcomeStatusFilterIds = [1, 2, 3, 4];
  }

  if (outcomeStatusFilterIds && outcomeStatusFilterIds.length > 0) {
    whereClause.outcomeStatusId = {
      in: outcomeStatusFilterIds,
    };
  }

  // Apply filter based on filter type
  const filterType = searchParams?.filter;
  if (filterType === "today") {
    // Filter for viewings scheduled today (same day, any time)
    whereClause.viewingDate = {
      not: null,
      gte: todayStart,
      lte: todayEnd,
    };
  } else if (filterType === "scheduled") {
    // Filter for scheduled viewings (has viewingDate and is in the future or today)
    whereClause.viewingDate = {
      not: null,
      gte: todayStart,
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
      outcomeStatus: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Fetch stakeholders for visibility management (type <= 5)
  const allStakeholders = await prisma.stakeholder.findMany({
    where: {
      type: {
        lte: 5,
      },
      isDeleted: false,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      type: true,
    },
  });

  // Keep separate stakeholders list for agent selection (type 5)
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
      type: true,
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
      type: true,
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

  const extrasRaw = await prisma.viewingExtra.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      estimation: true,
    },
  });

  const outcomeStatuses = await prisma.viewingOutcomeStatus.findMany({
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
  const extras = extrasRaw.map((extra: any) => ({
    id: extra.id,
    name: extra.name,
    description: extra.description,
    estimation: extra.estimation ? Number(extra.estimation) : null,
  }));

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
      linkToPhotos: viewing.linkToPhotos ?? null,
      metroStationDistanceLevel: viewing.metroStationDistanceLevel ?? null,
      transportation: viewing.transportation ?? null,
      overallLevel: viewing.overallLevel ?? null,
      isArchive: viewing.isArchive ?? false,
    };
  });

  const hasOutcomeStatusFilter =
    outcomeStatusFilterIds !== null && outcomeStatusFilterIds.length > 0;
  const hasPriceFilter = priceMinRaw !== undefined || priceMaxRaw !== undefined;
  const hasSizeFilter = sizeMinRaw !== undefined || sizeMaxRaw !== undefined;
  const hasQuickFilter = filterType === "today" || filterType === "scheduled";
  const hasArchiveFilter = showArchived;
  const hasAnyFilter =
    hasQuickFilter || hasArchiveFilter || hasOutcomeStatusFilter || hasPriceFilter || hasSizeFilter;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ViewingsFilterPanel outcomeStatuses={outcomeStatuses} />

        {viewings.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            {hasAnyFilter ? (
              <>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  No viewings match the current filters.
                </p>
                <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                  <Button
                    href="/viewings"
                    tooltip="Clear all filters"
                    className="sm:w-auto"
                  >
                    Clear filters
                  </Button>
                </div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
                  You can also adjust the filters in the panel above.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  No viewings found.
                </p>
                <Button
                  href="/viewings/new"
                  icon={<PlusIcon className="h-5 w-5" />}
                  tooltip="Create your first viewing"
                  className="mt-4"
                />
              </>
            )}
          </div>
        ) : (
          <ViewingsTable
            viewings={serializedViewings}
            stakeholders={stakeholders}
            allStakeholders={allStakeholders}
            scheduleStakeholders={scheduleStakeholders}
            qualityLevels={qualityLevels}
            extras={extras}
            outcomeStatuses={outcomeStatuses}
          />
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Showing {viewings.length} viewing
            {viewings.length !== 1 ? "s" : ""}
          </span>
          {(filterType === "scheduled" || filterType === "today") && (
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
