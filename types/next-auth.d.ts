import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      branchId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    branchId?: string | null;
  }
}
