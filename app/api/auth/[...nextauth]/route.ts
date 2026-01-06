import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists, create if not
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user
          await prisma.user.create({
            data: {
              email: user.email,
              isActive: true,
            },
          });
        } else if (!existingUser.isActive) {
          // Reject sign-in if user is inactive
          return false;
        }
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // If redirecting to a relative URL, use baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If redirecting to same origin, allow it
      if (new URL(url).origin === baseUrl) return url;
      // Default redirect to /viewings
      return `${baseUrl}/viewings`;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Fetch user from database to get latest data
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.email = dbUser.email;
          token.stakeholderId = dbUser.stakeholderId;
        }

        // Extract name from Google profile
        if (profile && 'name' in profile) {
          token.name = profile.name as string | null;
        } else if (user.name) {
          token.name = user.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as number;
        (session.user as any).email = token.email as string;
        (session.user as any).name = token.name as string | null;
        (session.user as any).stakeholderId = token.stakeholderId as number | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const { GET, POST } = handlers;

