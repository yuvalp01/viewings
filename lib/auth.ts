import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function getServerSession() {
  return await auth();
}

export type Session = Awaited<ReturnType<typeof getServerSession>>;

export type User = {
  id: number;
  email: string;
  stakeholderId: number | null;
};

