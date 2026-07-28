"use client";

import { useEffect, useState } from "react";
import type { Flashcard } from "@/lib/topics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Props = {
  card: Flashcard;
  cardNumber: number;
  onPrev: () => void;
  onNext: () => void;
};

export function FlipMode({ card, cardNumber, onPrev, onNext }: Props) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flip-scene w-full text-left"
        aria-label={flipped ? "Zobrazit otázku" : "Zobrazit odpověď"}
      >
        <div
          className={`flip-card relative h-75 w-full sm:h-85 ${
            flipped ? "is-flipped" : ""
          }`}
        >
          <Card className="section-card flip-face absolute inset-0 flex flex-col justify-between gap-0 p-8 shadow-lg ring-0">
            <Badge className="w-fit border-transparent bg-primary/15 text-primary">
              Otázka {cardNumber}
            </Badge>
            <p className="font-card text-2xl leading-snug font-medium sm:text-3xl">
              {card.question}
            </p>
            <span className="text-sm text-muted-foreground">
              Klikni nebo stiskni mezerník pro překlopení
            </span>
          </Card>
          <Card className="section-card-answer flip-face flip-face-back absolute inset-0 flex flex-col justify-between gap-0 p-8 shadow-lg ring-0">
            <Badge className="w-fit border-transparent bg-primary text-primary-foreground">
              Odpověď {cardNumber}
            </Badge>
            <p className="font-card text-xl leading-relaxed font-medium sm:text-2xl">
              {card.answer}
            </p>
            <span className="text-sm text-muted-foreground">
              Klikni nebo stiskni mezerník pro otázku
            </span>
          </Card>
        </div>
      </button>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onPrev}>
          ← Předchozí
        </Button>
        <Button type="button" onClick={onNext}>
          Další →
        </Button>
      </div>
    </div>
  );
}
