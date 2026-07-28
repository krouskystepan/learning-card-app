"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  username: string | null;
};

export function AuthNav({ username }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    try {
      await signOut({ redirect: false });
      toast.success("Odhlášen");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Odhlášení selhalo");
    }
  }

  if (!username) {
    if (pathname === "/login") return null;

    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">
          <LogIn data-icon="inline-start" />
          Přihlásit
        </Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={logout}>
      <LogOut data-icon="inline-start" />
      Odhlásit se
    </Button>
  );
}
