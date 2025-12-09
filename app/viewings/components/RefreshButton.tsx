"use client";

import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import { RefreshIcon } from "@/app/components/icons";

export default function RefreshButton() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <Button
      onClick={handleRefresh}
      icon={<RefreshIcon className="h-5 w-5" />}
      tooltip="Refresh viewings"
      variant="secondary"
    />
  );
}

