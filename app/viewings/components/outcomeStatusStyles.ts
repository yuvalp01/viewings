/** Sentinel for "No outcome" (NULL) in the outcome filter. */
export const NULL_OUTCOME_ID = "null" as const;

export function getOutcomeStatusClasses(outcomeStatusId?: number | string | null): string {
  // "No outcome" (NULL) – neutral/slate style
  if (outcomeStatusId === NULL_OUTCOME_ID || outcomeStatusId === null) {
    return "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-600";
  }
  switch (outcomeStatusId) {
    case 1: // Good opportunity
      return "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700";
    case 2: // Good but expensive
      return "bg-amber-50 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 border-amber-200 dark:border-amber-700";
    case 3: // Possible for low price
      return "bg-lime-50 text-lime-800 dark:bg-lime-900/30 dark:text-lime-200 border-lime-200 dark:border-lime-700";
    case 4: // Offer given
      return "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-700";
    case 5: // No way
      return "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-700";
    case 6: // Bought by us
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700";
    case 7: // Bought by others
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700";
    default:
      return "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700";
  }
}

