"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarCheckIcon,
  CalendarIcon,
  ArchiveIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/app/components/icons";
import { getOutcomeStatusClasses } from "./outcomeStatusStyles";

interface OutcomeStatusOption {
  id: number;
  name: string;
}

interface ViewingsFilterPanelProps {
  outcomeStatuses: OutcomeStatusOption[];
}

export default function ViewingsFilterPanel({ outcomeStatuses }: ViewingsFilterPanelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Only render on the /viewings page
  if (pathname !== "/viewings") {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);

  const [priceMinInput, setPriceMinInput] = useState<string>(searchParams.get("priceMin") ?? "");
  const [priceMaxInput, setPriceMaxInput] = useState<string>(searchParams.get("priceMax") ?? "");
  const [sizeMinInput, setSizeMinInput] = useState<string>(searchParams.get("sizeMin") ?? "");
  const [sizeMaxInput, setSizeMaxInput] = useState<string>(searchParams.get("sizeMax") ?? "");
  const [rangeErrors, setRangeErrors] = useState<{
    priceMin?: string;
    priceMax?: string;
    sizeMin?: string;
    sizeMax?: string;
  }>({});

  // Sync local inputs when URL params change (e.g. via back/forward or other controls)
  useEffect(() => {
    setPriceMinInput(searchParams.get("priceMin") ?? "");
    setPriceMaxInput(searchParams.get("priceMax") ?? "");
    setSizeMinInput(searchParams.get("sizeMin") ?? "");
    setSizeMaxInput(searchParams.get("sizeMax") ?? "");
  }, [searchParams]);

  // When there is no explicit outcomeStatusIds param, we treat 1–4 as the default selection.
  const todayActive = searchParams.get("filter") === "today";
  const scheduledActive = searchParams.get("filter") === "scheduled";
  const archiveActive = searchParams.get("showArchived") === "true";
  const outcomeStatusIdsRaw = searchParams.get("outcomeStatusIds");
  const selectedOutcomeStatusIds = useMemo(() => {
    if (outcomeStatusIdsRaw === "none") {
      // Explicit "no outcome filter"
      return [];
    }
    if (!outcomeStatusIdsRaw || outcomeStatusIdsRaw.trim() === "") {
      // No explicit param → default selection 1–4
      return [1, 2, 3, 4];
    }
    return outcomeStatusIdsRaw
      .split(",")
      .map((value) => parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value));
  }, [outcomeStatusIdsRaw]);

  const hasOutcomeStatusFilter =
    outcomeStatusIdsRaw !== "none" && selectedOutcomeStatusIds.length > 0;
  const hasPriceFilter = !!searchParams.get("priceMin") || !!searchParams.get("priceMax");
  const hasSizeFilter = !!searchParams.get("sizeMin") || !!searchParams.get("sizeMax");
  const hasActiveFilters =
    todayActive || scheduledActive || archiveActive || hasOutcomeStatusFilter || hasPriceFilter || hasSizeFilter;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (todayActive || scheduledActive) count += 1;
    if (archiveActive) count += 1;
    if (hasOutcomeStatusFilter) count += 1;
    if (hasPriceFilter) count += 1;
    if (hasSizeFilter) count += 1;
    return count;
  }, [archiveActive, hasOutcomeStatusFilter, hasPriceFilter, hasSizeFilter, scheduledActive, todayActive]);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(newUrl);
    });
  };

  const handleTodayToggle = () => {
    updateSearchParams((params) => {
      if (todayActive) {
        params.delete("filter");
      } else {
        if (params.get("filter") === "scheduled") {
          params.delete("filter");
        }
        params.set("filter", "today");
      }
    });
  };

  const handleScheduledToggle = () => {
    updateSearchParams((params) => {
      if (scheduledActive) {
        params.delete("filter");
      } else {
        if (params.get("filter") === "today") {
          params.delete("filter");
        }
        params.set("filter", "scheduled");
      }
    });
  };

  const handleArchiveToggle = () => {
    updateSearchParams((params) => {
      if (archiveActive) {
        params.delete("showArchived");
      } else {
        params.set("showArchived", "true");
      }
    });
  };

  const handleOutcomeStatusToggle = (id: number) => {
    updateSearchParams((params) => {
      const raw = params.get("outcomeStatusIds");
      let currentIds: number[] = [];
      if (raw === "none") {
        currentIds = [];
      } else if (!raw || raw.trim() === "") {
        // No explicit param yet → start from the default 1–4
        currentIds = [1, 2, 3, 4];
      } else {
        currentIds = raw
          .split(",")
          .map((value) => parseInt(value.trim(), 10))
          .filter((value) => !Number.isNaN(value));
      }

      const exists = currentIds.includes(id);
      const nextIds = exists ? currentIds.filter((value) => value !== id) : [...currentIds, id];

      if (nextIds.length === 0) {
        // Explicitly represent "no outcome filter"
        params.set("outcomeStatusIds", "none");
      } else {
        params.set("outcomeStatusIds", nextIds.join(","));
      }
    });
  };

  const handleRangeCommit = (key: "priceMin" | "priceMax" | "sizeMin" | "sizeMax", value: string) => {
    const trimmed = value.trim();

    setRangeErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));

    updateSearchParams((params) => {
      if (!trimmed) {
        params.delete(key);
        return;
      }
      const numeric = Number(trimmed);
      if (Number.isNaN(numeric) || numeric < 0) {
        setRangeErrors((prev) => ({
          ...prev,
          [key]: "Please enter a non-negative number or leave empty.",
        }));
        return;
      }
      params.set(key, String(numeric));
    });
  };

  const handleClearAll = () => {
    updateSearchParams((params) => {
      params.delete("filter");
      params.delete("showArchived");
      // Explicit "no outcome filter" for this state
      params.set("outcomeStatusIds", "none");
      params.delete("priceMin");
      params.delete("priceMax");
      params.delete("sizeMin");
      params.delete("sizeMax");
    });
  };

  const activeSummary = useMemo(() => {
    const parts: string[] = [];
    if (todayActive) {
      parts.push("Today");
    } else if (scheduledActive) {
      parts.push("Scheduled");
    }
    if (archiveActive) {
      parts.push("Archived");
    }
    if (hasOutcomeStatusFilter) {
      parts.push(`${selectedOutcomeStatusIds.length} outcome${selectedOutcomeStatusIds.length > 1 ? "s" : ""}`);
    }
    if (hasPriceFilter) {
      const min = searchParams.get("priceMin");
      const max = searchParams.get("priceMax");
      if (min && max) {
        parts.push(`Price ${min}–${max}`);
      } else if (min) {
        parts.push(`Price ≥ ${min}`);
      } else if (max) {
        parts.push(`Price ≤ ${max}`);
      }
    }
    if (hasSizeFilter) {
      const min = searchParams.get("sizeMin");
      const max = searchParams.get("sizeMax");
      if (min && max) {
        parts.push(`Size ${min}–${max} m²`);
      } else if (min) {
        parts.push(`Size ≥ ${min} m²`);
      } else if (max) {
        parts.push(`Size ≤ ${max} m²`);
      }
    }
    if (parts.length === 0) {
      return "No filters applied";
    }
    return parts.join(" • ");
  }, [
    archiveActive,
    hasOutcomeStatusFilter,
    hasPriceFilter,
    hasSizeFilter,
    searchParams,
    selectedOutcomeStatusIds.length,
    scheduledActive,
    todayActive,
  ]);

  return (
    <div className="sticky top-16 z-40 mb-4">
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Accordion header */}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="viewings-filter-panel-body"
          aria-busy={isPending}
          onClick={() => {
            setIsOpen((prev) => {
              return !prev;
            });
          }}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3 cursor-pointer"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Filters
            </span>
            <span className="mt-0.5 line-clamp-1 text-xs text-zinc-600 dark:text-zinc-300">{activeSummary}</span>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white dark:bg-blue-600">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
              </span>
            )}
            {isPending && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Loading…
              </span>
            )}
            {isOpen ? (
              <ChevronUpIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-300" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-300" />
            )}
          </div>
        </button>

        {/* Accordion body */}
        {isOpen && (
          <div
            id="viewings-filter-panel-body"
            className="border-t border-zinc-200 px-3 py-3 text-xs sm:px-4 sm:py-4 dark:border-zinc-800"
          >
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {/* Quick filters */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Quick filters
                </div>
                <div className="flex flex-wrap gap-2 md:gap-2.5">
                  <button
                    type="button"
                    onClick={handleTodayToggle}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] sm:text-xs transition-colors cursor-pointer ${
                      todayActive
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-200"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                    aria-pressed={todayActive}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>Today</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleScheduledToggle}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] sm:text-xs transition-colors cursor-pointer ${
                      scheduledActive
                        ? "border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/30 dark:text-green-200"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                    aria-pressed={scheduledActive}
                  >
                    <CalendarCheckIcon className="h-3.5 w-3.5" />
                    <span>Scheduled</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleArchiveToggle}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] sm:text-xs transition-colors cursor-pointer ${
                      archiveActive
                        ? "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-400 dark:bg-orange-900/30 dark:text-orange-200"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                    aria-pressed={archiveActive}
                  >
                    <ArchiveIcon className="h-3.5 w-3.5" />
                    <span>Archived</span>
                  </button>
                </div>
              </div>

              {/* Outcome status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Outcome
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {outcomeStatuses.map((status) => {
                    const isSelected = selectedOutcomeStatusIds.includes(status.id);
                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => handleOutcomeStatusToggle(status.id)}
                        aria-pressed={isSelected}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] sm:text-xs transition-colors cursor-pointer ${getOutcomeStatusClasses(
                          status.id
                        )} ${
                          isSelected
                            ? "opacity-100 ring-1 ring-offset-0 ring-blue-400 dark:ring-blue-500"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <span className="truncate max-w-[120px] sm:max-w-[160px]">{status.name}</span>
                        {isSelected && <span className="text-[10px] font-semibold">✓</span>}
                      </button>
                    );
                  })}
                  {outcomeStatuses.length === 0 && (
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">No outcome options</span>
                  )}
                </div>
              </div>

              {/* Price / Size ranges */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Price range (€)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-zinc-500 dark:text-zinc-400">Min</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        placeholder="e.g. 300000"
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        value={priceMinInput}
                        onChange={(e) => setPriceMinInput(e.target.value)}
                        onBlur={() => handleRangeCommit("priceMin", priceMinInput)}
                      />
                      {rangeErrors.priceMin && (
                        <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">{rangeErrors.priceMin}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-zinc-500 dark:text-zinc-400">Max</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        placeholder="e.g. 600000"
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        value={priceMaxInput}
                        onChange={(e) => setPriceMaxInput(e.target.value)}
                        onBlur={() => handleRangeCommit("priceMax", priceMaxInput)}
                      />
                      {rangeErrors.priceMax && (
                        <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">{rangeErrors.priceMax}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Size range (m²)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-zinc-500 dark:text-zinc-400">Min</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        placeholder="e.g. 60"
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        value={sizeMinInput}
                        onChange={(e) => setSizeMinInput(e.target.value)}
                        onBlur={() => handleRangeCommit("sizeMin", sizeMinInput)}
                      />
                      {rangeErrors.sizeMin && (
                        <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">{rangeErrors.sizeMin}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] text-zinc-500 dark:text-zinc-400">Max</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        placeholder="e.g. 100"
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        value={sizeMaxInput}
                        onChange={(e) => setSizeMaxInput(e.target.value)}
                        onBlur={() => handleRangeCommit("sizeMax", sizeMaxInput)}
                      />
                      {rangeErrors.sizeMax && (
                        <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">{rangeErrors.sizeMax}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-[11px] sm:mt-4 sm:pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleClearAll}
                className="cursor-pointer text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Clear all
              </button>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Filters apply instantly as you change them
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

