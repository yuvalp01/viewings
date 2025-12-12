"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/app/components/Button";
import { CalendarCheckIcon, CalendarIcon } from "@/app/components/icons";

export default function ScheduledVisitsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActive = searchParams.get("filter") === "scheduled";
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isActive) {
      // Remove filter
      params.delete("filter");
    } else {
      // Add filter
      params.set("filter", "scheduled");
    }
    
    // Use replace to avoid adding to history stack
    startTransition(() => {
      const newUrl = params.toString() ? `/viewings?${params.toString()}` : "/viewings";
      router.replace(newUrl);
      router.refresh(); // Ensure server component re-renders with new params
    });
  };

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
            : "Show only scheduled visits (past week and future)"
        }
        variant={isActive ? "primary" : "secondary"}
        disabled={isPending}
      />
      {isActive && !isPending && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white dark:bg-green-600">
          <span className="sr-only">Filter active</span>
        </span>
      )}
    </div>
  );
}

