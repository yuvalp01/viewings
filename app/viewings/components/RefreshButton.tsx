"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import { RefreshIcon } from "@/app/components/icons";

export default function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the current route's data
      router.refresh();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      icon={
        <RefreshIcon
          className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
        />
      }
      tooltip="Refresh viewings"
      variant="secondary"
      disabled={isRefreshing}
    />
  );
}

