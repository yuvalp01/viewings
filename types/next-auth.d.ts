import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      name: string | null;
      stakeholderId: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    email: string;
    name: string | null;
    stakeholderId: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: number;
    email: string;
    name: string | null;
    stakeholderId: number | null;
  }
}

