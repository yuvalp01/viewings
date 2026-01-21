"use client";

import { usePathname } from "next/navigation";
import FiltersAccordion from "./FiltersAccordion";

export default function TopMenuFilters() {
  const pathname = usePathname();
  const isViewingsPage = pathname === "/viewings";

  if (!isViewingsPage) {
    return null;
  }

  return <FiltersAccordion />;
}
