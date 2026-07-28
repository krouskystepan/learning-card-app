"use client";

import { useRef, useState } from "react";
import type { Flashcard } from "@/lib/topics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  card: Flashcard;
  cardNumber: number;
  onPrev: () => void;
  onNext: () => void;
};

export function TypeMode({ card, cardNumber, onPrev, onNext }: Props) {
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const check = () => setRevealed(true);

  return (
    <div className="flex flex-col gap-6">
      <Card className="section-card gap-0 p-8 shadow-lg ring-0">
        <Badge className="w-fit border-transparent bg-primary/15 text-primary">
          Otázka {cardNumber}
        </Badge>
        <p className="mt-4 font-card text-2xl leading-snug font-medium sm:text-3xl">
          {card.question}
        </p>

        <div className="mt-8 space-y-2">
          <Label htmlFor="answer">Tvoje odpověď</Label>
          <Textarea
            id="answer"
            ref={inputRef}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                if (!revealed) check();
              }
            }}
            rows={4}
            disabled={revealed}
            placeholder="Napiš odpověď vlastními slovy…"
            className="field-sizing-fixed min-h-24 resize-y overflow-y-auto bg-muted/40"
          />
        </div>

        {!revealed ? (
          <Button type="button" className="mt-4" onClick={check}>
            Zkontrolovat
          </Button>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="section-card-answer rounded-xl border p-5">
              <Badge className="mb-2 border-transparent bg-primary text-primary-foreground">
                Správná odpověď {cardNumber}
              </Badge>
              <p className="font-card text-lg leading-relaxed">{card.answer}</p>
            </div>
            {draft.trim() && (
              <div className="rounded-xl bg-muted/60 p-5">
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Tvoje odpověď
                </p>
                <p className="text-base leading-relaxed">{draft}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Porovnej odpovědi a ohodnoť se:
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="bg-know text-white hover:bg-know/90"
                onClick={onNext}
              >
                Vím
              </Button>
              <Button
                type="button"
                className="bg-miss text-white hover:bg-miss/90"
                onClick={onNext}
              >
                Nevím
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onPrev}>
          ← Předchozí
        </Button>
        <Button type="button" variant="outline" onClick={onNext}>
          Přeskočit →
        </Button>
      </div>
    </div>
  );
}
