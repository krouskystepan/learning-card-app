import { ObjectId } from "mongodb";
import { sections, topics } from "@/lib/db";
import {
  DEFAULT_SECTION_COLOR,
  DEFAULT_SECTION_ICON,
  normalizeSectionColor,
  normalizeSectionIcon,
  type SectionColorId,
  type SectionIconId,
} from "@/lib/section-style";

export type Flashcard = {
  question: string;
  answer: string;
};

export type Topic = {
  title: string;
  flashcards: Flashcard[];
};

export type TopicSummary = {
  slug: string;
  title: string;
  cardCount: number;
};

export type Section = {
  slug: string;
  name: string;
  icon: SectionIconId;
  color: SectionColorId;
  topics: TopicSummary[];
};

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 1, 2, 10… then letters (Czech, numeric-aware). */
export function compareByName(a: string, b: string): number {
  return a.localeCompare(b, "cs", { numeric: true, sensitivity: "base" });
}

export function parseFlashcards(raw: unknown): Flashcard[] {
  if (!Array.isArray(raw)) {
    throw new Error("flashcards musí být pole");
  }
  return raw.map((card, i) => {
    if (
      !card ||
      typeof card !== "object" ||
      typeof (card as Flashcard).question !== "string" ||
      typeof (card as Flashcard).answer !== "string"
    ) {
      throw new Error(`Neplatná kartička na indexu ${i}`);
    }
    return {
      question: (card as Flashcard).question.trim(),
      answer: (card as Flashcard).answer.trim(),
    };
  });
}

export async function listSections(): Promise<Section[]> {
  const sectionCol = await sections();
  const topicCol = await topics();

  const allSections = await sectionCol
    .find({})
    .sort({ name: 1 })
    .toArray();

  const result = await Promise.all(
    allSections.map(async (section) => {
      const sectionTopics = await topicCol
        .find({ sectionId: section._id })
        .toArray();

      const topics = sectionTopics
        .map((t) => ({
          slug: t.slug,
          title: t.title,
          cardCount: t.flashcards.length,
        }))
        .sort((a, b) => compareByName(a.title, b.title));

      return {
        slug: section.slug,
        name: section.name,
        icon: normalizeSectionIcon(section.icon),
        color: normalizeSectionColor(section.color),
        topics,
      };
    }),
  );

  return result.sort((a, b) => compareByName(a.name, b.name));
}

export async function getSectionBySlug(slug: string) {
  const col = await sections();
  return col.findOne({ slug });
}

export async function loadTopic(
  sectionSlug: string,
  topicSlug: string,
): Promise<Topic> {
  const col = await topics();
  const doc = await col.findOne({ sectionSlug, slug: topicSlug });
  if (!doc) {
    throw new Error(`Téma nenalezeno: ${sectionSlug}/${topicSlug}`);
  }
  return { title: doc.title, flashcards: doc.flashcards };
}

export async function getTopicDoc(sectionSlug: string, topicSlug: string) {
  const col = await topics();
  return col.findOne({ sectionSlug, slug: topicSlug });
}

export async function getAllTopicParams(): Promise<
  { section: string; topic: string }[]
> {
  const col = await topics();
  const docs = await col
    .find({}, { projection: { sectionSlug: 1, slug: 1 } })
    .toArray();
  return docs.map((d) => ({ section: d.sectionSlug, topic: d.slug }));
}

export async function createSection(input: {
  name: string;
  icon?: string;
  color?: string;
}) {
  const trimmed = input.name.trim();
  if (!trimmed) throw new Error("Název sekce je povinný");

  const slug = slugify(trimmed);
  if (!slug) throw new Error("Neplatný název sekce");

  const icon = normalizeSectionIcon(input.icon ?? DEFAULT_SECTION_ICON);
  const color = normalizeSectionColor(input.color ?? DEFAULT_SECTION_COLOR);

  const col = await sections();
  const existing = await col.findOne({
    $or: [{ slug }, { name: trimmed }],
  });
  if (existing) throw new Error("Sekce s tímto názvem už existuje");

  const now = new Date();
  const result = await col.insertOne({
    name: trimmed,
    slug,
    icon,
    color,
    createdAt: now,
    updatedAt: now,
  });

  return { id: result.insertedId.toString(), name: trimmed, slug, icon, color };
}

export async function updateSection(
  slug: string,
  input: { name: string; icon?: string; color?: string },
) {
  const trimmed = input.name.trim();
  if (!trimmed) throw new Error("Název sekce je povinný");

  const newSlug = slugify(trimmed);
  if (!newSlug) throw new Error("Neplatný název sekce");

  const icon = normalizeSectionIcon(input.icon ?? DEFAULT_SECTION_ICON);
  const color = normalizeSectionColor(input.color ?? DEFAULT_SECTION_COLOR);

  const col = await sections();
  const section = await col.findOne({ slug });
  if (!section) throw new Error("Sekce nenalezena");

  if (newSlug !== slug) {
    const clash = await col.findOne({ slug: newSlug });
    if (clash) throw new Error("Sekce s tímto názvem už existuje");
  }

  const now = new Date();
  await col.updateOne(
    { _id: section._id },
    {
      $set: {
        name: trimmed,
        slug: newSlug,
        icon,
        color,
        updatedAt: now,
      },
    },
  );

  if (newSlug !== slug) {
    const topicCol = await topics();
    await topicCol.updateMany(
      { sectionId: section._id },
      { $set: { sectionSlug: newSlug, updatedAt: now } },
    );
  }

  return { name: trimmed, slug: newSlug, icon, color };
}

export async function deleteSection(slug: string) {
  const col = await sections();
  const section = await col.findOne({ slug });
  if (!section) throw new Error("Sekce nenalezena");

  const topicCol = await topics();
  await topicCol.deleteMany({ sectionId: section._id });
  await col.deleteOne({ _id: section._id });
}

export async function createTopic(input: {
  sectionSlug: string;
  title: string;
  flashcards: Flashcard[];
}) {
  const title = input.title.trim();
  if (!title) throw new Error("Název tématu je povinný");

  const section = await getSectionBySlug(input.sectionSlug);
  if (!section) throw new Error("Sekce nenalezena");

  const base = slugify(title);
  if (!base) throw new Error("Neplatný název tématu");

  const col = await topics();
  let slug = base;
  let n = 2;
  while (await col.findOne({ sectionId: section._id, slug })) {
    slug = `${base}-${n}`;
    n += 1;
  }

  const flashcards = parseFlashcards(input.flashcards);
  const now = new Date();
  const result = await col.insertOne({
    sectionId: section._id,
    sectionSlug: section.slug,
    slug,
    title,
    flashcards,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: result.insertedId.toString(),
    sectionSlug: section.slug,
    slug,
    title,
    cardCount: flashcards.length,
  };
}

export async function updateTopic(
  sectionSlug: string,
  topicSlug: string,
  input: {
    title?: string;
    flashcards?: Flashcard[];
  },
) {
  const col = await topics();
  const doc = await col.findOne({ sectionSlug, slug: topicSlug });
  if (!doc) throw new Error("Téma nenalezeno");

  const title = input.title?.trim() ?? doc.title;
  if (!title) throw new Error("Název tématu je povinný");

  const flashcards =
    input.flashcards !== undefined
      ? parseFlashcards(input.flashcards)
      : doc.flashcards;

  await col.updateOne(
    { _id: doc._id },
    {
      $set: {
        title,
        flashcards,
        updatedAt: new Date(),
      },
    },
  );

  return {
    sectionSlug,
    slug: doc.slug,
    title,
    cardCount: flashcards.length,
  };
}

export async function deleteTopic(sectionSlug: string, topicSlug: string) {
  const col = await topics();
  const result = await col.deleteOne({ sectionSlug, slug: topicSlug });
  if (result.deletedCount === 0) throw new Error("Téma nenalezeno");
}

export function isObjectId(id: string) {
  return ObjectId.isValid(id);
}
