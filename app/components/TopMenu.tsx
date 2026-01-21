import CompactUserHeader from "./CompactUserHeader";
import TopMenuFilters from "./TopMenuFilters";
import TopMenuNav from "./TopMenuNav";
import TopMenuViewingsActions from "./TopMenuViewingsActions";

export default function TopMenu() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="mx-auto max-w-7xl px-1 sm:px-2 lg:px-4">
        {/* Single Row Layout - Desktop & Mobile */}
        <div className="flex h-14 sm:h-16 items-center justify-between gap-1 sm:gap-2 overflow-x-auto">
          {/* Left: Navigation Links */}
          <div className="flex-shrink-0">
            <TopMenuNav />
          </div>

          {/* Center: Filters (only on viewings page) */}
          <div className="flex-1 flex justify-center min-w-0">
            <TopMenuFilters />
          </div>

          {/* Right: Actions + User Header */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <TopMenuViewingsActions />
            <CompactUserHeader />
          </div>
        </div>
      </div>
    </nav>
  );
}
