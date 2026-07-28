"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function subscribe() {
  return () => {};
}

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="relative"
          aria-label="Přepnout motiv"
        >
          <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Přepnout motiv</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={mounted && theme === "light" ? "bg-accent" : undefined}
        >
          <Sun />
          Světlý
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={mounted && theme === "dark" ? "bg-accent" : undefined}
        >
          <Moon />
          Tmavý
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={mounted && theme === "system" ? "bg-accent" : undefined}
        >
          <Monitor />
          Systém
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
