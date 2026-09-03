import { ObjectId } from 'mongodb'
import { sections, topics, users } from '@/lib/db'
import { isMainAdminUsername } from '@/lib/users'
import {
  DEFAULT_SECTION_COLOR,
  DEFAULT_SECTION_ICON,
  normalizeSectionColor,
  normalizeSectionIcon,
  type SectionColorId,
  type SectionIconId
} from '@/lib/section-style'

export type Flashcard = {
  question: string
  answer: string
}

export type Topic = {
  title: string
  flashcards: Flashcard[]
}

export type TopicSummary = {
  slug: string
  title: string
  cardCount: number
  createdBy: string | null
}

export type Section = {
  slug: string
  name: string
  icon: SectionIconId
  color: SectionColorId
  createdBy: string | null
  editors: string[]
  topics: TopicSummary[]
}

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** 1, 2, 10… then letters (Czech, numeric-aware). */
export function compareByName(a: string, b: string): number {
  return a.localeCompare(b, 'cs', { numeric: true, sensitivity: 'base' })
}

/** Client components can only receive plain strings, not BSON ObjectIds. */
export function toPlainUsername(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return null
}

export function toPlainUsernames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [
    ...new Set(
      value.map(toPlainUsername).filter((name): name is string => name !== null)
    )
  ]
}

function asObjectId(value: unknown): ObjectId | null {
  if (value instanceof ObjectId) return value
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { toHexString?: unknown }).toHexString === 'function'
  ) {
    try {
      const hex = (value as ObjectId).toHexString()
      if (ObjectId.isValid(hex)) return new ObjectId(hex)
    } catch {
      return null
    }
  }
  return null
}

function usernameOf(value: unknown, byId: Map<string, string>): string | null {
  const plain = toPlainUsername(value)
  if (plain) return plain
  const id = asObjectId(value)
  if (id) return byId.get(id.toHexString()) ?? null
  return null
}

function collectUserId(value: unknown, ids: ObjectId[]) {
  const id = asObjectId(value)
  if (id) ids.push(id)
}

async function usernamesById(ids: ObjectId[]): Promise<Map<string, string>> {
  const unique = [...new Map(ids.map((id) => [id.toHexString(), id])).values()]
  const map = new Map<string, string>()
  if (unique.length === 0) return map

  const col = await users()
  const docs = await col
    .find({ _id: { $in: unique } }, { projection: { username: 1 } })
    .toArray()
  for (const doc of docs) {
    const name = toPlainUsername(doc.username)
    if (name) map.set(doc._id.toHexString(), name)
  }
  return map
}

export async function ownerUsername(value: unknown): Promise<string | null> {
  const plain = toPlainUsername(value)
  if (plain) return plain
  const id = asObjectId(value)
  if (!id) return null
  const map = await usernamesById([id])
  return map.get(id.toHexString()) ?? null
}

export function parseFlashcards(raw: unknown): Flashcard[] {
  if (!Array.isArray(raw)) {
    throw new Error('flashcards musí být pole')
  }
  return raw.map((card, i) => {
    if (
      !card ||
      typeof card !== 'object' ||
      typeof (card as Flashcard).question !== 'string' ||
      typeof (card as Flashcard).answer !== 'string'
    ) {
      throw new Error(`Neplatná kartička na indexu ${i}`)
    }
    return {
      question: (card as Flashcard).question.trim(),
      answer: (card as Flashcard).answer.trim()
    }
  })
}

export async function listSections(): Promise<Section[]> {
  const sectionCol = await sections()
  const topicCol = await topics()

  const allSections = await sectionCol.find({}).sort({ name: 1 }).toArray()

  const ownerIds: ObjectId[] = []
  const topicsBySection = await Promise.all(
    allSections.map(async (section) => {
      const sectionTopics = await topicCol
        .find({ sectionId: section._id })
        .toArray()
      collectUserId(section.createdBy, ownerIds)
      for (const editor of section.editors ?? [])
        collectUserId(editor, ownerIds)
      for (const topic of sectionTopics)
        collectUserId(topic.createdBy, ownerIds)
      return sectionTopics
    })
  )
  const byId = await usernamesById(ownerIds)

  const result = allSections.map((section, i) => {
    const topics = topicsBySection[i]
      .map((t) => ({
        slug: t.slug,
        title: t.title,
        cardCount: t.flashcards.length,
        createdBy: usernameOf(t.createdBy, byId)
      }))
      .sort((a, b) => compareByName(a.title, b.title))

    return {
      slug: section.slug,
      name: section.name,
      icon: normalizeSectionIcon(section.icon),
      color: normalizeSectionColor(section.color),
      createdBy: usernameOf(section.createdBy, byId),
      editors: [
        ...new Set(
          (section.editors ?? [])
            .map((name) => usernameOf(name, byId))
            .filter((name): name is string => name !== null)
        )
      ],
      topics
    }
  })

  return result.sort((a, b) => compareByName(a.name, b.name))
}

export async function getSectionBySlug(slug: string) {
  const col = await sections()
  return col.findOne({ slug })
}

export async function loadTopic(
  sectionSlug: string,
  topicSlug: string
): Promise<Topic> {
  const col = await topics()
  const doc = await col.findOne({ sectionSlug, slug: topicSlug })
  if (!doc) {
    throw new Error(`Téma nenalezeno: ${sectionSlug}/${topicSlug}`)
  }
  return { title: doc.title, flashcards: doc.flashcards }
}

export async function getTopicDoc(sectionSlug: string, topicSlug: string) {
  const col = await topics()
  return col.findOne({ sectionSlug, slug: topicSlug })
}

export async function getAllTopicParams(): Promise<
  { section: string; topic: string }[]
> {
  const col = await topics()
  const docs = await col
    .find({}, { projection: { sectionSlug: 1, slug: 1 } })
    .toArray()
  return docs.map((d) => ({ section: d.sectionSlug, topic: d.slug }))
}

export async function createSection(input: {
  name: string
  icon?: string
  color?: string
  createdBy: string
}) {
  const trimmed = input.name.trim()
  if (!trimmed) throw new Error('Název sekce je povinný')

  const slug = slugify(trimmed)
  if (!slug) throw new Error('Neplatný název sekce')

  const icon = normalizeSectionIcon(input.icon ?? DEFAULT_SECTION_ICON)
  const color = normalizeSectionColor(input.color ?? DEFAULT_SECTION_COLOR)

  const col = await sections()
  const existing = await col.findOne({
    $or: [{ slug }, { name: trimmed }]
  })
  if (existing) throw new Error('Sekce s tímto názvem už existuje')

  const now = new Date()
  const result = await col.insertOne({
    name: trimmed,
    slug,
    icon,
    color,
    createdBy: input.createdBy,
    editors: [],
    createdAt: now,
    updatedAt: now
  })

  return {
    id: result.insertedId.toString(),
    name: trimmed,
    slug,
    icon,
    color,
    createdBy: input.createdBy,
    editors: [] as string[]
  }
}

export async function updateSection(
  slug: string,
  input: { name: string; icon?: string; color?: string }
) {
  const trimmed = input.name.trim()
  if (!trimmed) throw new Error('Název sekce je povinný')

  const newSlug = slugify(trimmed)
  if (!newSlug) throw new Error('Neplatný název sekce')

  const icon = normalizeSectionIcon(input.icon ?? DEFAULT_SECTION_ICON)
  const color = normalizeSectionColor(input.color ?? DEFAULT_SECTION_COLOR)

  const col = await sections()
  const section = await col.findOne({ slug })
  if (!section) throw new Error('Sekce nenalezena')

  if (newSlug !== slug) {
    const clash = await col.findOne({ slug: newSlug })
    if (clash) throw new Error('Sekce s tímto názvem už existuje')
  }

  const now = new Date()
  await col.updateOne(
    { _id: section._id },
    {
      $set: {
        name: trimmed,
        slug: newSlug,
        icon,
        color,
        updatedAt: now
      }
    }
  )

  if (newSlug !== slug) {
    const topicCol = await topics()
    await topicCol.updateMany(
      { sectionId: section._id },
      { $set: { sectionSlug: newSlug, updatedAt: now } }
    )
  }

  return { name: trimmed, slug: newSlug, icon, color }
}

export function sectionEditors(
  section: { editors?: unknown } | null | undefined
): string[] {
  return toPlainUsernames(section?.editors)
}

export async function updateSectionEditors(slug: string, raw: unknown) {
  if (!Array.isArray(raw)) {
    throw new Error('editors musí být pole')
  }

  const col = await sections()
  const section = await col.findOne({ slug })
  if (!section) throw new Error('Sekce nenalezena')

  const requested = [
    ...new Set(
      raw
        .filter((name): name is string => typeof name === 'string')
        .map((name) => name.trim())
        .filter(Boolean)
    )
  ]

  const owner = await ownerUsername(section.createdBy)
  const withoutOwner = requested.filter(
    (name) => name !== owner && !isMainAdminUsername(name)
  )

  if (withoutOwner.length === 0) {
    await col.updateOne(
      { _id: section._id },
      { $set: { editors: [], updatedAt: new Date() } }
    )
    return { editors: [] }
  }

  const userCol = await users()
  const existing = await userCol
    .find({ username: { $in: withoutOwner } }, { projection: { username: 1 } })
    .toArray()
  const known = new Set(existing.map((u) => u.username))
  const missing = withoutOwner.filter((name) => !known.has(name))
  if (missing.length > 0) {
    throw new Error(`Uživatel neexistuje: ${missing.join(', ')}`)
  }

  const editors = withoutOwner.sort((a, b) =>
    a.localeCompare(b, 'cs', { sensitivity: 'base' })
  )

  await col.updateOne(
    { _id: section._id },
    { $set: { editors, updatedAt: new Date() } }
  )

  return { editors }
}

export async function deleteSection(slug: string) {
  const col = await sections()
  const section = await col.findOne({ slug })
  if (!section) throw new Error('Sekce nenalezena')

  const topicCol = await topics()
  await topicCol.deleteMany({ sectionId: section._id })
  await col.deleteOne({ _id: section._id })
}

export async function createTopic(input: {
  sectionSlug: string
  title: string
  flashcards: Flashcard[]
  createdBy: string
}) {
  const title = input.title.trim()
  if (!title) throw new Error('Název tématu je povinný')

  const section = await getSectionBySlug(input.sectionSlug)
  if (!section) throw new Error('Sekce nenalezena')

  const base = slugify(title)
  if (!base) throw new Error('Neplatný název tématu')

  const col = await topics()
  let slug = base
  let n = 2
  while (await col.findOne({ sectionId: section._id, slug })) {
    slug = `${base}-${n}`
    n += 1
  }

  const flashcards = parseFlashcards(input.flashcards)
  const now = new Date()
  const result = await col.insertOne({
    sectionId: section._id,
    sectionSlug: section.slug,
    slug,
    title,
    flashcards,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now
  })

  return {
    id: result.insertedId.toString(),
    sectionSlug: section.slug,
    slug,
    title,
    cardCount: flashcards.length,
    createdBy: input.createdBy
  }
}

export async function updateTopic(
  sectionSlug: string,
  topicSlug: string,
  input: {
    title?: string
    flashcards?: Flashcard[]
  }
) {
  const col = await topics()
  const doc = await col.findOne({ sectionSlug, slug: topicSlug })
  if (!doc) throw new Error('Téma nenalezeno')

  const title = input.title?.trim() ?? doc.title
  if (!title) throw new Error('Název tématu je povinný')

  const flashcards =
    input.flashcards !== undefined
      ? parseFlashcards(input.flashcards)
      : doc.flashcards

  await col.updateOne(
    { _id: doc._id },
    {
      $set: {
        title,
        flashcards,
        updatedAt: new Date()
      }
    }
  )

  return {
    sectionSlug,
    slug: doc.slug,
    title,
    cardCount: flashcards.length
  }
}

export async function deleteTopic(sectionSlug: string, topicSlug: string) {
  const col = await topics()
  const result = await col.deleteOne({ sectionSlug, slug: topicSlug })
  if (result.deletedCount === 0) throw new Error('Téma nenalezeno')
}

export function isObjectId(id: string) {
  return ObjectId.isValid(id)
}
