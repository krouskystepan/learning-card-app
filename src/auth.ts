import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { users } from "@/lib/db";
import { normalizeRole } from "@/lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Uživatel", type: "text" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string"
            ? credentials.username.trim()
            : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!username || !password) return null;

        const col = await users();
        const user = await col.findOne({ username });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          role: normalizeRole(user.role),
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 14 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
  // Bump suffix when AUTH_SECRET changes — old cookies are ignored instead of erroring
  cookies: {
    sessionToken: {
      name: "authjs.session-token.v2",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        if (user.name) token.username = user.name;
        const role =
          "role" in user && (user.role === "owner" || user.role === "admin")
            ? user.role
            : "admin";
        token.role = role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (typeof token.username === "string") {
          session.user.name = token.username;
        }
        session.user.role = token.role === "owner" ? "owner" : "admin";
      }
      return session;
    },
  },
  trustHost: true,
});
