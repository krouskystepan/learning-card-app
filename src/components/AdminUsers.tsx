'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  KeyRound,
  Shield,
  Trash2,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminPasswordField } from '@/components/AdminPasswordField'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import type { AdminUser } from '@/lib/users'

function compareAdmins(a: AdminUser, b: AdminUser): number {
  if (a.role !== b.role) {
    if (a.role === 'owner') return -1
    if (b.role === 'owner') return 1
  }
  return a.username.localeCompare(b.username, 'cs')
}

type Props = {
  initialAdmins: AdminUser[]
}

function ResetPasswordDialog({ admin }: { admin: AdminUser }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setPassword('')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Heslo musí mít aspoň 8 znaků')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast.error(data.error || 'Změna hesla selhala')
        return
      }
      toast.success(`Heslo pro „${admin.username}“ změněno`)
      handleOpenChange(false)
    } catch {
      toast.error('Síťová chyba')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <KeyRound data-icon="inline-start" />
          Heslo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Nové heslo pro „{admin.username}“</DialogTitle>
            <DialogDescription>
              Zadej vlastní heslo, nebo si nech vygenerovat zapamatovatelné.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AdminPasswordField
              id={`reset-password-${admin.id}`}
              value={password}
              onChange={setPassword}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={saving || password.length < 8}>
              {saving ? 'Ukládám…' : 'Uložit heslo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminUsersPanel({ initialAdmins }: Props) {
  const [admins, setAdmins] = useState(initialAdmins)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)

  async function refreshAdmins() {
    try {
      const res = await fetch('/api/admins')
      const data = (await res.json()) as {
        admins?: AdminUser[]
        error?: string
      }
      if (!res.ok) {
        toast.error(data.error || 'Nepodařilo se načíst adminy')
        return
      }
      setAdmins(data.admins ?? [])
    } catch {
      toast.error('Síťová chyba')
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Heslo musí mít aspoň 8 znaků')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = (await res.json()) as {
        admin?: AdminUser
        error?: string
      }
      if (!res.ok) {
        toast.error(data.error || 'Vytvoření selhalo')
        return
      }
      toast.success(`Admin „${username.trim()}“ vytvořen`)
      setUsername('')
      setPassword('')
      if (data.admin) {
        setAdmins((prev) => [...prev, data.admin!].sort(compareAdmins))
      } else {
        await refreshAdmins()
      }
    } catch {
      toast.error('Síťová chyba')
    } finally {
      setCreating(false)
    }
  }

  async function onDelete(id: string, name: string) {
    try {
      const res = await fetch(`/api/admins/${id}`, { method: 'DELETE' })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast.error(data.error || 'Smazání selhalo')
        return
      }
      toast.success(`Admin „${name}“ smazán`)
      setAdmins((prev) => prev.filter((a) => a.id !== id))
    } catch {
      toast.error('Síťová chyba')
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            Zpět na okruhy
          </Link>
        </Button>
        <h1 className="font-card text-3xl font-semibold tracking-tight">
          Správa adminů
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Noví admini mohou vytvářet obsah a upravovat nebo mazat jen to, co
          sami vytvořili. Hlavní admin může spravovat vše.
        </p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="size-4" />
              Nový admin
            </CardTitle>
            <CardDescription>
              Vytvoř účet pro spolužačku nebo spolužáka.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Uživatel</Label>
                <Input
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  placeholder="jana.novak"
                  required
                  minLength={3}
                />
              </div>
              <AdminPasswordField
                id="admin-password"
                value={password}
                onChange={setPassword}
              />
              <Button
                type="submit"
                disabled={creating || password.length < 8}
                className="w-full"
              >
                {creating ? 'Vytvářím…' : 'Přidat admina'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-baseline justify-between gap-3 space-y-0">
            <CardTitle className="text-lg">Existující admini</CardTitle>
            <CardDescription className="shrink-0">
              {admins.length}{' '}
              {admins.length === 1
                ? 'účet'
                : admins.length < 5
                  ? 'účty'
                  : 'účtů'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {admins.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Zatím žádní další admini.
              </p>
            ) : (
              <ul className="divide-y border-t">
                {admins.map((admin) => (
                  <li
                    key={admin.id}
                    className="flex items-center gap-3 px-4 py-3 sm:px-6"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {admin.role === 'owner' ? (
                        <Shield className="size-4 text-primary" />
                      ) : (
                        <span className="text-sm font-semibold uppercase">
                          {admin.username.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{admin.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {admin.role === 'owner'
                          ? 'Hlavní admin'
                          : 'Bez správy účtů'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <ResetPasswordDialog admin={admin} />
                      {admin.role !== 'owner' ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`Smazat ${admin.username}`}
                            >
                              <Trash2 className="text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Smazat admina „{admin.username}“?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Uživatel se už nepřihlásí. Obsah zůstane.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Zrušit</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() =>
                                  onDelete(admin.id, admin.username)
                                }
                              >
                                Smazat
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
