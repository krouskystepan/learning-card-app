import { auth } from "@/auth";
import { canDeleteContent, canManageContent, canManageEditors } from "@/lib/permissions";
import { normalizeRole, type UserRole } from "@/lib/users";

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
    const role = normalizeRole(session.user.role, username);
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

export function requireContentAccess(
  session: SessionPayload,
  createdBy?: string | null,
  editors?: string[] | null,
) {
  if (!canManageContent(session, createdBy, editors)) {
    throw new AuthError(
      "Tento obsah může upravit jen autor, editor nebo hlavní admin",
      403,
    );
  }
}

export function requireDeleteAccess(
  session: SessionPayload,
  createdBy?: string | null,
  extraOwner?: string | null,
) {
  if (
    !canDeleteContent(session, createdBy) &&
    !canDeleteContent(session, extraOwner)
  ) {
    throw new AuthError(
      "Smazat může jen autor nebo hlavní admin",
      403,
    );
  }
}

export function requireEditorsAccess(
  session: SessionPayload,
  createdBy?: string | null,
) {
  if (!canManageEditors(session, createdBy)) {
    throw new AuthError(
      "Spolupracovníky může spravovat jen autor sekce nebo hlavní admin",
      403,
    );
  }
}
