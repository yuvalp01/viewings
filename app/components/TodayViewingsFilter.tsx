"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Button from "@/app/components/Button";
import { CalendarCheckIcon, CalendarIcon } from "@/app/components/icons";

export default function TodayViewingsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = searchParams.get("filter") === "today";
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isActive) {
      // Remove filter
      params.delete("filter");
    } else {
      // Add filter (removes any existing filter since they're mutually exclusive)
      params.set("filter", "today");
    }
    
    // Use replace to avoid adding to history stack
    startTransition(() => {
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      router.refresh(); // Ensure server component re-renders with new params
    });
  };

  // Only show on viewings page
  if (pathname !== "/viewings") {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={handleToggle}
        icon={
          isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : isActive ? (
            <CalendarCheckIcon className="h-5 w-5" />
          ) : (
            <CalendarIcon className="h-5 w-5" />
          )
        }
        tooltip={
          isActive
            ? "Show all viewings"
            : "Show only today's viewings"
        }
        variant={isActive ? "primary" : "secondary"}
        disabled={isPending}
      />
      {isActive && !isPending && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white dark:bg-blue-600">
          <span className="sr-only">Filter active</span>
        </span>
      )}
    </div>
  );
}
