import type { JWT } from "next-auth/jwt";
import type { UserRole } from "@/lib/users";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    role?: UserRole;
  }
}

export type { JWT };
