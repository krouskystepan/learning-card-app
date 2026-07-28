import Link from "next/link";
import { Users } from "lucide-react";
import { AuthNav } from "@/components/AuthNav";
import { ModeToggle } from "@/components/mode-toggle";
import { CreateSectionDialog } from "@/components/SectionAdmin";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/users";

type Props = {
  username: string | null;
  role: UserRole | null;
};

export function SiteNavbar({ username, role }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="font-card text-lg font-semibold tracking-tight text-foreground hover:opacity-80"
        >
          Maturitní kartičky
        </Link>

        <nav className="flex items-center gap-2">
          {username && role === "owner" && (
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/admins">
                <Users data-icon="inline-start" />
                Admini
              </Link>
            </Button>
          )}
          {username && <CreateSectionDialog />}
          <AuthNav username={username} />
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
