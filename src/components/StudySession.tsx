"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shuffle } from "lucide-react";
import type { Flashcard } from "@/lib/topics";
import {
  sectionColorVars,
  type SectionColorId,
} from "@/lib/section-style";
import { FlipMode } from "@/components/FlipMode";
import { TypeMode } from "@/components/TypeMode";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Mode = "flip" | "type";
type OrderMode = "sequential" | "random";

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

type Props = {
  title: string;
  flashcards: Flashcard[];
  color: SectionColorId;
};

export function StudySession({ title, flashcards, color }: Props) {
  const [mode, setMode] = useState<Mode>("flip");
  const [orderMode, setOrderMode] = useState<OrderMode>("sequential");
  const [order, setOrder] = useState(() => flashcards.map((_, i) => i));
  const [index, setIndex] = useState(0);

  const cards = useMemo(
    () => order.map((i) => flashcards[i]),
    [flashcards, order],
  );

  const current = cards[index];
  const total = cards.length;

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : total - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < total - 1 ? i + 1 : 0));
  }, [total]);

  const applyOrderMode = (next: OrderMode) => {
    setOrderMode(next);
    setIndex(0);
    if (next === "sequential") {
      setOrder(flashcards.map((_, i) => i));
      return;
    }
    setOrder(shuffle(flashcards.map((_, i) => i)));
  };

  if (!current) {
    return (
      <p className="p-8 text-muted-foreground">Toto téma nemá žádné kartičky.</p>
    );
  }

  return (
    <div
      className="section-theme mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10"
      style={sectionColorVars(color)}
    >
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" />
              Zpět na okruhy
            </Link>
          </Button>
          <h1 className="font-card text-3xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value) => {
              if (value === "flip" || value === "type") {
                setMode(value);
                setIndex(0);
              }
            }}
            variant="outline"
            size="sm"
            spacing={0}
          >
            <ToggleGroupItem
              value="flip"
              className="px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
            >
              Překlopit
            </ToggleGroupItem>
            <ToggleGroupItem
              value="type"
              className="px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
            >
              Psát odpověď
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Kartička{" "}
          <span className="font-semibold text-foreground">{index + 1}</span> z{" "}
          {total}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={orderMode}
            onValueChange={(value) => {
              if (value === "sequential" || value === "random") {
                applyOrderMode(value);
              }
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Pořadí kartiček"
          >
            <ToggleGroupItem
              value="sequential"
              className="px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
            >
              Postupně
            </ToggleGroupItem>
            <ToggleGroupItem
              value="random"
              className="px-3 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
            >
              Náhodně
            </ToggleGroupItem>
          </ToggleGroup>

          {orderMode === "random" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyOrderMode("random")}
              title="Znovu zamíchat"
            >
              <Shuffle data-icon="inline-start" />
              Zamíchat znovu
            </Button>
          )}
        </div>
      </div>

      <Progress value={((index + 1) / total) * 100} className="mb-8 h-1.5" />

      <div className="flex-1">
        {mode === "flip" ? (
          <FlipMode
            key={`${mode}-${order.join("-")}-${index}`}
            card={current}
            onPrev={goPrev}
            onNext={goNext}
          />
        ) : (
          <TypeMode
            key={`${mode}-${order.join("-")}-${index}`}
            card={current}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
      </div>
    </div>
  );
}
