import { MongoClient, Db, Collection, ObjectId, OptionalId } from "mongodb";
import type { Flashcard } from "@/lib/topics";

export type UserDoc = {
  _id: ObjectId;
  username: string;
  passwordHash: string;
  /** owner = hlavní admin (může spravovat adminy); admin = editor bez této pravomoci */
  role?: "owner" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
};

export type SectionDoc = {
  _id: ObjectId;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TopicDoc = {
  _id: ObjectId;
  sectionId: ObjectId;
  sectionSlug: string;
  slug: string;
  title: string;
  flashcards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  return uri;
}

function getDbName() {
  return process.env.MONGODB_DB || "learning-cards";
}

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(getUri());
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(getDbName());
}

export async function users(): Promise<Collection<OptionalId<UserDoc>>> {
  return (await getDb()).collection<OptionalId<UserDoc>>("users");
}

export async function sections(): Promise<Collection<OptionalId<SectionDoc>>> {
  return (await getDb()).collection<OptionalId<SectionDoc>>("sections");
}

export async function topics(): Promise<Collection<OptionalId<TopicDoc>>> {
  return (await getDb()).collection<OptionalId<TopicDoc>>("topics");
}
