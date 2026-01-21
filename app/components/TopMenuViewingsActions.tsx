"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import { PlusIcon, RefreshIcon } from "@/app/components/icons";

export default function TopMenuViewingsActions() {
  const pathname = usePathname();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Only show on viewings page
  if (pathname !== "/viewings") {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      router.refresh();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        onClick={handleRefresh}
        icon={
          <RefreshIcon
            className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        }
        tooltip="Refresh viewings"
        variant="secondary"
        disabled={isRefreshing}
      />
      <Button
        href="/viewings/new"
        icon={<PlusIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />}
        tooltip="Create a new viewing"
        variant="secondary"
      />
    </div>
  );
}
