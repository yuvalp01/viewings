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
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-zinc-200 bg-white/90 backdrop-blur-sm px-4 py-2.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="flex flex-col items-end">
        {session.user.name && (
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {session.user.name}
          </div>
        )}
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          {userEmail}
        </div>
      </div>
      <div className="flex-shrink-0">
        <LogoutButton />
      </div>
    </div>
  );
}

