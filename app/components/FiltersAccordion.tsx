"use client";

import { useState, useRef, useEffect } from "react";
import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Button from "@/app/components/Button";
import { ChevronDownIcon, ChevronUpIcon, CalendarCheckIcon, CalendarIcon, ArchiveIcon } from "@/app/components/icons";

export default function FiltersAccordion() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [outcomeStatuses, setOutcomeStatuses] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingOutcomeStatuses, setIsLoadingOutcomeStatuses] = useState(false);

  // Only show on viewings page
  if (pathname !== "/viewings") {
    return null;
  }

  const todayActive = searchParams.get("filter") === "today";
  const scheduledActive = searchParams.get("filter") === "scheduled";
  const archiveActive = searchParams.get("showArchived") === "true";
  const hasOutcomeStatusFilter = !!searchParams.get("outcomeStatusIds");
  const hasActiveFilters = todayActive || scheduledActive || archiveActive || hasOutcomeStatusFilter;

  const handleTodayToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (todayActive) {
      params.delete("filter");
    } else {
      // Remove scheduled filter if active (they're mutually exclusive)
      if (params.get("filter") === "scheduled") {
        params.delete("filter");
      }
      params.set("filter", "today");
    }
    
    setIsOpen(false); // Close accordion after selection
    startTransition(() => {
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      router.refresh();
    });
  };

  const handleScheduledToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (scheduledActive) {
      params.delete("filter");
    } else {
      // Remove today filter if active (they're mutually exclusive)
      if (params.get("filter") === "today") {
        params.delete("filter");
      }
      params.set("filter", "scheduled");
    }
    
    setIsOpen(false); // Close accordion after selection
    startTransition(() => {
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      router.refresh();
    });
  };

  const handleArchiveToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (archiveActive) {
      params.delete("showArchived");
    } else {
      params.set("showArchived", "true");
    }
    
    // Don't close accordion for archive filter (user might want to toggle multiple filters)
    startTransition(() => {
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      router.refresh();
    });
  };

  const handleOutcomeStatusChange = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const raw = params.get("outcomeStatusIds") ?? "";
    const currentIds = raw
      .split(",")
      .map((value) => parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value));

    const exists = currentIds.includes(id);
    const nextIds = exists
      ? currentIds.filter((value) => value !== id)
      : [...currentIds, id];

    if (nextIds.length === 0) {
      params.delete("outcomeStatusIds");
    } else {
      params.set("outcomeStatusIds", nextIds.join(","));
    }

    startTransition(() => {
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      router.refresh();
    });
  };

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640; // sm breakpoint
      // On mobile, use a fixed compact width; on desktop, use button width
      const calculatedWidth = isMobile ? 120 : rect.width;
      setDropdownPosition({
        top: rect.bottom + 8, // 8px = mt-2
        left: rect.left,
        width: calculatedWidth,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Load outcome statuses when the dropdown first opens
  useEffect(() => {
    if (!isOpen || isLoadingOutcomeStatuses || outcomeStatuses.length > 0) {
      return;
    }

    const loadStatuses = async () => {
      try {
        setIsLoadingOutcomeStatuses(true);
        const response = await fetch("/api/viewing-outcome-statuses");
        if (!response.ok) {
          throw new Error("Failed to load outcome statuses");
        }
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setOutcomeStatuses(
            json.data.map((status: { id: number; name: string }) => ({
              id: status.id,
              name: status.name,
            }))
          );
        }
      } catch (error) {
        // Log for debugging; keep UI graceful
        console.error(error);
      } finally {
        setIsLoadingOutcomeStatuses(false);
      }
    };

    loadStatuses();
  }, [isOpen, isLoadingOutcomeStatuses, outcomeStatuses.length]);

  return (
    <div className="relative w-auto">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-1.5 sm:gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <span className="flex items-center gap-1.5 sm:gap-2">
          Filters
          {hasActiveFilters && (
            <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-blue-500 text-[9px] sm:text-[10px] font-bold text-white dark:bg-blue-600">
              {(todayActive ? 1 : 0) + (scheduledActive ? 1 : 0) + (archiveActive ? 1 : 0)}
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronUpIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ) : (
          <ChevronDownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[100] rounded-lg border border-zinc-200 bg-white p-1.5 sm:p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 w-[120px] sm:w-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="flex flex-col gap-1.5 sm:gap-2 sm:flex-row items-center sm:items-start">
            <div className="relative">
              <Button
                onClick={handleTodayToggle}
                icon={
                  isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : todayActive ? (
                    <CalendarCheckIcon className="h-5 w-5" />
                  ) : (
                    <CalendarIcon className="h-5 w-5" />
                  )
                }
                tooltip={
                  todayActive
                    ? "Show all viewings"
                    : "Show only today's viewings"
                }
                variant={todayActive ? "primary" : "secondary"}
                disabled={isPending}
              />
              {todayActive && !isPending && (
                <span className="absolute right-0 top-0 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white dark:bg-blue-600 translate-x-1/2 -translate-y-1/2">
                  <span className="sr-only">Filter active</span>
                </span>
              )}
            </div>

            <div className="relative">
              <Button
                onClick={handleScheduledToggle}
                icon={
                  isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <CalendarCheckIcon className="h-5 w-5" />
                  )
                }
                tooltip={
                  scheduledActive
                    ? "Show all viewings"
                    : "Show only upcoming scheduled viewings"
                }
                variant={scheduledActive ? "primary" : "secondary"}
                disabled={isPending}
              />
              {scheduledActive && !isPending && (
                <span className="absolute right-0 top-0 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 text-[8px] font-bold text-white dark:bg-green-600 translate-x-1/2 -translate-y-1/2">
                  <span className="sr-only">Filter active</span>
                </span>
              )}
            </div>

            <div className="relative">
              <Button
                onClick={handleArchiveToggle}
                icon={
                  isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <ArchiveIcon className="h-5 w-5" />
                  )
                }
                tooltip={
                  archiveActive
                    ? "Hide archived viewings"
                    : "Show archived viewings"
                }
                variant={archiveActive ? "primary" : "secondary"}
                disabled={isPending}
              />
              {archiveActive && !isPending && (
                <span className="absolute right-0 top-0 flex h-3 w-3 items-center justify-center rounded-full bg-orange-500 text-[8px] font-bold text-white dark:bg-orange-600 translate-x-1/2 -translate-y-1/2">
                  <span className="sr-only">Filter active</span>
                </span>
              )}
            </div>

            {outcomeStatuses.length > 0 && (
              <div className="mt-1.5 w-full sm:w-auto border-t border-zinc-200 pt-1.5 dark:border-zinc-700">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Outcome status
                </div>
                <div className="flex flex-col gap-1">
                  {outcomeStatuses.map((status) => {
                    const params = new URLSearchParams(searchParams.toString());
                    const raw = params.get("outcomeStatusIds") ?? "";
                    const currentIds = raw
                      .split(",")
                      .map((value) => parseInt(value.trim(), 10))
                      .filter((value) => !Number.isNaN(value));
                    const selected = currentIds.includes(status.id);

                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => handleOutcomeStatusChange(status.id)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-[11px] sm:text-xs transition-colors ${
                          selected
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className="truncate">{status.name}</span>
                        {selected && (
                          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
