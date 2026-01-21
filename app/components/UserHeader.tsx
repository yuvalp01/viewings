import { getServerSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function UserHeader() {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  const userName = session.user.name || session.user.email;
  const userEmail = session.user.email;

  return (
    <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 sm:px-4 sm:py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col items-end min-w-0">
        {session.user.name && (
          <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px] sm:max-w-none">
            {session.user.name}
          </div>
        )}
        <div className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[120px] sm:max-w-none">
          {userEmail}
        </div>
      </div>
      <div className="flex-shrink-0">
        <LogoutButton />
      </div>
    </div>
  );
}

