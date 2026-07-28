"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

type Props = {
  sectionSlug: string;
  topicSlug: string;
  title: string;
};

export function TopicActions({ sectionSlug, topicSlug, title }: Props) {
  const router = useRouter();

  async function remove() {
    try {
      const res = await fetch(`/api/topics/${sectionSlug}/${topicSlug}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error || "Smazání tématu selhalo");
        return;
      }
      toast.success(`Téma „${title}“ smazáno`);
      router.refresh();
    } catch {
      toast.error("Síťová chyba");
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost" size="icon-sm" aria-label="Upravit téma">
        <Link href={`/admin/topics/${sectionSlug}/${topicSlug}`}>
          <Pencil />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Smazat téma"
          >
            <Trash2 className="text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat téma „{title}“?</AlertDialogTitle>
            <AlertDialogDescription>
              Smažou se všechny kartičky v tomto tématu. Tuto akci nelze vrátit.
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
  );
}

export function NewTopicButton({ sectionSlug }: { sectionSlug: string }) {
  return (
    <Button asChild size="sm" variant="outline">
      <Link href={`/admin/topics/new?section=${sectionSlug}`}>
        <Plus data-icon="inline-start" />
        Nové téma
      </Link>
    </Button>
  );
}
