'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react'
import { SectionStylePicker } from '@/components/SectionStylePicker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DEFAULT_SECTION_COLOR,
  DEFAULT_SECTION_ICON,
  type SectionColorId,
  type SectionIconId
} from '@/lib/section-style'

export function CreateSectionDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<SectionIconId>(DEFAULT_SECTION_ICON)
  const [color, setColor] = useState<SectionColorId>(DEFAULT_SECTION_COLOR)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon, color })
      })
      const data = (await res.json()) as { error?: string; slug?: string }
      if (!res.ok) {
        toast.error(data.error || 'Nepodařilo se vytvořit sekci')
        return
      }
      toast.success(`Sekce „${name.trim()}“ vytvořena`)
      setOpen(false)
      setName('')
      setIcon(DEFAULT_SECTION_ICON)
      setColor(DEFAULT_SECTION_COLOR)
      router.refresh()
    } catch {
      toast.error('Síťová chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="max-sm:px-2" aria-label="Nová sekce">
          <Plus />
          <span className="hidden sm:inline">Nová sekce</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Nová sekce</DialogTitle>
            <DialogDescription>
              Vyber ikonu a jemnou barvu - sekce se odliší na přehledu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-name">Název</Label>
              <Input
                id="section-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maturita - Ekonomika"
                required
              />
            </div>
            <SectionStylePicker
              icon={icon}
              color={color}
              onIconChange={setIcon}
              onColorChange={setColor}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Ukládám…' : 'Vytvořit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type SectionActionsProps = {
  slug: string
  name: string
  icon: SectionIconId
  color: SectionColorId
  canShare: boolean
  canDelete: boolean
}

export function SectionActions({
  slug,
  name,
  icon: initialIcon,
  color: initialColor,
  canShare,
  canDelete
}: SectionActionsProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [newName, setNewName] = useState(name)
  const [icon, setIcon] = useState<SectionIconId>(initialIcon)
  const [color, setColor] = useState<SectionColorId>(initialColor)
  const [loading, setLoading] = useState(false)

  function openEdit(next: boolean) {
    if (next) {
      setNewName(name)
      setIcon(initialIcon)
      setColor(initialColor)
    }
    setEditOpen(next)
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/sections/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, icon, color })
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast.error(data.error || 'Uložení sekce selhalo')
        return
      }
      toast.success('Sekce uložena')
      setEditOpen(false)
      router.refresh()
    } catch {
      toast.error('Síťová chyba')
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    try {
      const res = await fetch(`/api/sections/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        toast.error(data.error || 'Smazání sekce selhalo')
        return
      }
      toast.success(`Sekce „${name}“ smazána`)
      router.refresh()
    } catch {
      toast.error('Síťová chyba')
    }
  }

  return (
    <div className="flex items-center gap-1">
      {canShare && <SectionEditorsDialog slug={slug} name={name} />}
      <Dialog open={editOpen} onOpenChange={openEdit}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Upravit sekci"
          >
            <Pencil />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={save}>
            <DialogHeader>
              <DialogTitle>Upravit sekci</DialogTitle>
              <DialogDescription>
                Změň název, ikonu nebo barvu sekce.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor={`edit-${slug}`}>Název</Label>
                <Input
                  id={`edit-${slug}`}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <SectionStylePicker
                icon={icon}
                color={color}
                onIconChange={setIcon}
                onColorChange={setColor}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Ukládám…' : 'Uložit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {canDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Smazat sekci"
            >
              <Trash2 className="text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Smazat sekci „{name}“?</AlertDialogTitle>
              <AlertDialogDescription>
                Smaže se i všechna témata a kartičky v této sekci. Tuto akci
                nelze vrátit.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Zrušit</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={remove}>
                Smazat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

type EditorsResponse = {
  editors?: string[]
  users?: string[]
  createdBy?: string | null
  error?: string
}

function SectionEditorsDialog({ slug, name }: { slug: string; name: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editors, setEditors] = useState<string[]>([])
  const [users, setUsers] = useState<string[]>([])
  const [picked, setPicked] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sections/${slug}/editors`)
      const data = (await res.json()) as EditorsResponse
      if (!res.ok) {
        toast.error(data.error || 'Nepodařilo se načíst editory')
        return
      }
      setEditors(data.editors ?? [])
      setUsers(data.users ?? [])
      setPicked('')
    } catch {
      toast.error('Síťová chyba')
    } finally {
      setLoading(false)
    }
  }

  function openShare(next: boolean) {
    setOpen(next)
    if (next) void load()
  }

  const available = users.filter((u) => !editors.includes(u))

  async function persist(next: string[]) {
    setSaving(true)
    try {
      const res = await fetch(`/api/sections/${slug}/editors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editors: next })
      })
      const data = (await res.json()) as { editors?: string[]; error?: string }
      if (!res.ok) {
        toast.error(data.error || 'Uložení editorů selhalo')
        return
      }
      setEditors(data.editors ?? next)
      setPicked('')
      router.refresh()
    } catch {
      toast.error('Síťová chyba')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={openShare}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Spravovat editory sekce"
        >
          <UserPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editoři sekce</DialogTitle>
          <DialogDescription>
            U „{name}“ můžou tito uživatelé sekci i témata upravovat, ale ne
            mazat. Přidávat a odebírat je může jen autor sekce nebo hlavní
            admin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Načítám…</p>
          ) : (
            <>
              <div className="space-y-2">
                {editors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Zatím žádní další editoři.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {editors.map((username) => (
                      <li
                        key={username}
                        className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5"
                      >
                        <span className="truncate text-sm font-medium">
                          {username}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          disabled={saving}
                          onClick={() =>
                            void persist(editors.filter((u) => u !== username))
                          }
                        >
                          Odebrat
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {available.length > 0 ? (
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor={`editor-${slug}`}>Přidat uživatele</Label>
                    <Select
                      value={picked}
                      onValueChange={setPicked}
                    >
                      <SelectTrigger id={`editor-${slug}`} className="w-full">
                        <SelectValue placeholder="Vyber uživatele" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {available.map((username) => (
                          <SelectItem key={username} value={username}>
                            {username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    disabled={!picked || saving}
                    onClick={() => void persist([...editors, picked])}
                  >
                    Přidat
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Žádní další uživatelé k přidání.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
