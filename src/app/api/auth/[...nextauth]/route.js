import NextAuth from "next-auth";
import { authOptions } from "@/src/lib/auth";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is not set in environment variables");
  throw new Error("NEXTAUTH_SECRET is required for NextAuth to work");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
