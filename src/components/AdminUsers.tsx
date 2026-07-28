"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Shield, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AdminUser = {
  id: string;
  username: string;
  role: "owner" | "admin";
};

export function AdminUsersPanel() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admins");
      const data = (await res.json()) as {
        admins?: AdminUser[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Nepodařilo se načíst adminy");
        return;
      }
      setAdmins(data.admins ?? []);
    } catch {
      toast.error("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Vytvoření selhalo");
        return;
      }
      toast.success(`Admin „${username.trim()}“ vytvořen`);
      setUsername("");
      setPassword("");
      await load();
    } catch {
      toast.error("Síťová chyba");
    } finally {
      setCreating(false);
    }
  }

  async function onResetPassword(id: string, name: string) {
    const next = window.prompt(`Nové heslo pro „${name}“ (min. 8 znaků):`);
    if (next == null) return;
    try {
      const res = await fetch(`/api/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: next }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Změna hesla selhala");
        return;
      }
      toast.success(`Heslo pro „${name}“ změněno`);
    } catch {
      toast.error("Síťová chyba");
    }
  }

  async function onDelete(id: string, name: string) {
    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Smazání selhalo");
        return;
      }
      toast.success(`Admin „${name}“ smazán`);
      await load();
    } catch {
      toast.error("Síťová chyba");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/">
          <ArrowLeft data-icon="inline-start" />
          Zpět na okruhy
        </Link>
      </Button>

      <header className="mb-8">
        <h1 className="font-card text-3xl font-semibold tracking-tight">
          Správa adminů
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Noví admini mohou upravovat obsah, ale nemohou přidávat další adminy.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
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
              <div className="space-y-2">
                <Label htmlFor="admin-password">Heslo</Label>
                <PasswordInput
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="min. 8 znaků"
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? "Vytvářím…" : "Přidat admina"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Existující admini</CardTitle>
            <CardDescription>
              {loading
                ? "Načítám…"
                : `${admins.length} ${admins.length === 1 ? "účet" : admins.length < 5 ? "účty" : "účtů"}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Načítám seznam…
              </p>
            ) : admins.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Zatím žádní další admini.
              </p>
            ) : (
              <ul className="divide-y border-t">
                {admins.map((admin) => (
                  <li
                    key={admin.id}
                    className="flex items-center justify-between gap-3 px-6 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {admin.role === "owner" ? (
                          <Shield className="size-4 text-primary" />
                        ) : (
                          <span className="text-sm font-semibold uppercase">
                            {admin.username.slice(0, 1)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{admin.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {admin.role === "owner"
                            ? "Hlavní admin"
                            : "Admin — bez správy účtů"}
                        </p>
                      </div>
                    </div>
                    {admin.role !== "owner" && (
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onResetPassword(admin.id, admin.username)
                          }
                        >
                          <KeyRound data-icon="inline-start" />
                          Heslo
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
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
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
