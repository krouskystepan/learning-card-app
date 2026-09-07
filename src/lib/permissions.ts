import type { UserRole } from '@/lib/users'

export type ContentActor = {
  username: string
  role: UserRole
}

function isEditor(actor: ContentActor, editors?: string[] | null): boolean {
  return Boolean(editors?.includes(actor.username))
}

/** Main admin, creator, or an added editor can edit. */
export function canManageContent(
  actor: ContentActor | null | undefined,
  createdBy?: string | null,
  editors?: string[] | null
): boolean {
  if (!actor) return false
  if (actor.role === 'owner') return true
  if (createdBy && createdBy === actor.username) return true
  return isEditor(actor, editors)
}

/** Main admin or creator can delete. Added editors cannot. */
export function canDeleteContent(
  actor: ContentActor | null | undefined,
  createdBy?: string | null
): boolean {
  if (!actor) return false
  if (actor.role === 'owner') return true
  return Boolean(createdBy) && createdBy === actor.username
}

/** Editors plus the section creator - all can manage topics in the section. */
export function sectionCollaborators(
  section?: {
    createdBy?: string | null
    editors?: string[] | null
  } | null
): string[] {
  const names = [...(section?.editors ?? [])]
  if (section?.createdBy) names.push(section.createdBy)
  return names
}

/** Only the main admin or the creator may add/remove editors. */
export function canManageEditors(
  actor: ContentActor | null | undefined,
  createdBy?: string | null
): boolean {
  if (!actor) return false
  if (actor.role === 'owner') return true
  return Boolean(createdBy) && createdBy === actor.username
}
