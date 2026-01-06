"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/app/components/Button";
import { ArchiveIcon } from "@/app/components/icons";

export default function ShowArchivedFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActive = searchParams.get("showArchived") === "true";
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isActive) {
      // Remove filter
      params.delete("showArchived");
    } else {
      // Add filter
      params.set("showArchived", "true");
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
          ) : (
            <ArchiveIcon className="h-5 w-5" />
          )
        }
        tooltip={
          isActive
            ? "Hide archived viewings"
            : "Show archived viewings"
        }
        variant={isActive ? "primary" : "secondary"}
        disabled={isPending}
      />
      {isActive && !isPending && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white dark:bg-orange-600">
          <span className="sr-only">Filter active</span>
        </span>
      )}
    </div>
  );
}

