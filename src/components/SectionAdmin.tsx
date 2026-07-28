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
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { SectionStylePicker } from '@/components/SectionStylePicker'
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
        <Button size="sm">
          <Plus data-icon="inline-start" />
          Nová sekce
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
}

export function SectionActions({
  slug,
  name,
  icon: initialIcon,
  color: initialColor
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
              Smaže se i všechna témata a kartičky v této sekci. Tuto akci nelze
              vrátit.
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
    </div>
  )
}
