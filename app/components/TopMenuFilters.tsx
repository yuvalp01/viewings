"use client";

import { usePathname } from "next/navigation";

export default function TopMenuFilters() {
  const pathname = usePathname();
  const isViewingsPage = pathname === "/viewings";

  // The main /viewings page now has its own full-width sticky filter panel,
  // so we intentionally render no additional filters in the top menu there.
  if (isViewingsPage) {
    return null;
  }

  return null;
}
