import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { users, type UserDoc } from "@/lib/db";

export type UserRole = "owner" | "admin";

export const MAIN_ADMIN_USERNAME = "admin";

export function isMainAdminUsername(
  username: string | null | undefined,
): boolean {
  return username?.trim().toLowerCase() === MAIN_ADMIN_USERNAME;
}

export type AdminUser = {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string | null;
};

export function normalizeRole(
  value: unknown,
  username?: string | null,
): UserRole {
  if (isMainAdminUsername(username)) return "owner";
  return value === "owner" ? "owner" : "admin";
}

export async function listUsernames(): Promise<string[]> {
  const col = await users();
  const docs = await col
    .find({}, { projection: { username: 1 } })
    .sort({ username: 1 })
    .toArray();
  return docs.map((doc) => doc.username);
}

/** Owners first, then username (cs). */
export function compareAdmins(a: AdminUser, b: AdminUser): number {
  if (a.role !== b.role) {
    if (a.role === "owner") return -1;
    if (b.role === "owner") return 1;
  }
  return a.username.localeCompare(b.username, "cs");
}

export async function listAdmins(): Promise<AdminUser[]> {
  const col = await users();
  const docs = await col
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ username: 1 })
    .toArray();

  return docs.map((doc) => toAdminUser(doc)).sort(compareAdmins);
}

export async function createAdmin(input: {
  username: string;
  password: string;
}): Promise<AdminUser> {
  const username = input.username.trim();
  const password = input.password;

  if (!username) throw new Error("Uživatelské jméno je povinné");
  if (username.length < 3) throw new Error("Uživatelské jméno musí mít aspoň 3 znaky");
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    throw new Error("Uživatelské jméno smí obsahovat jen písmena, čísla, . _ -");
  }
  if (isMainAdminUsername(username)) {
    throw new Error("Uživatelské jméno „admin“ je vyhrazené pro hlavního admina");
  }
  if (password.length < 8) throw new Error("Heslo musí mít aspoň 8 znaků");

  const col = await users();
  const existing = await col.findOne({ username });
  if (existing) throw new Error("Uživatel s tímto jménem už existuje");

  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await col.insertOne({
    username,
    passwordHash,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: result.insertedId.toString(),
    username,
    role: "admin",
    createdAt: now.toISOString(),
  };
}

export async function updateAdminPassword(
  id: string,
  password: string,
): Promise<void> {
  if (password.length < 8) throw new Error("Heslo musí mít aspoň 8 znaků");

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    throw new Error("Neplatný uživatel");
  }

  const col = await users();
  const user = await col.findOne({ _id: objectId });
  if (!user) throw new Error("Uživatel nenalezen");

  const passwordHash = await bcrypt.hash(password, 12);
  await col.updateOne(
    { _id: objectId },
    { $set: { passwordHash, updatedAt: new Date() } },
  );
}

export async function deleteAdmin(id: string, actorUsername: string): Promise<void> {
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    throw new Error("Neplatný uživatel");
  }

  const col = await users();
  const user = await col.findOne({ _id: objectId });
  if (!user) throw new Error("Uživatel nenalezen");
  if (normalizeRole(user.role, user.username) === "owner") {
    throw new Error("Hlavního admina nelze smazat");
  }
  if (user.username === actorUsername) {
    throw new Error("Nemůžeš smazat sám sebe");
  }

  await col.deleteOne({ _id: objectId });
}

function toAdminUser(doc: UserDoc): AdminUser {
  return {
    id: doc._id.toString(),
    username: doc.username,
    role: normalizeRole(doc.role, doc.username),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}
