import { auth } from "@/auth";
import type { UserRole } from "@/lib/users";

export type SessionPayload = {
  username: string;
  role: UserRole;
};

export class AuthError extends Error {
  status: number;

  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const session = await auth();
    const username = session?.user?.name;
    if (!username) return null;
    const role = session.user.role === "owner" ? "owner" : "admin";
    return { username, role };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new AuthError("Unauthorized", 401);
  return session;
}

/** Only the root owner may manage other admins. */
export async function requireOwner(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "owner") {
    throw new AuthError("Forbidden", 403);
  }
  return session;
}
