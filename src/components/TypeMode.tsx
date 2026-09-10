'use client'

import type { Flashcard } from '@/lib/topics'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTypeAnswer } from '@/hooks/use-type-answer'

type Props = {
  card: Flashcard
  cardNumber: number
  onPrev: () => void
  onNext: () => void
  onKnow: () => void
  onMiss: () => void
}

export function TypeMode({
  card,
  cardNumber,
  onPrev,
  onNext,
  onKnow,
  onMiss
}: Props) {
  const { draft, setDraft, revealed, inputRef, check, onDraftKeyDown } =
    useTypeAnswer()

  return (
    <div className="flex flex-col gap-6">
      <Card className="section-card gap-0 p-5 shadow-lg ring-0 sm:p-8">
        <Badge className="w-fit border-transparent bg-primary/15 text-primary">
          Otázka {cardNumber}
        </Badge>
        <p className="mt-4 font-card text-xl leading-snug font-medium sm:text-3xl">
          {card.question}
        </p>

        {!revealed ? (
          <>
            <div className="mt-8 space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="answer">Tvoje odpověď</Label>
                <span className="text-xs text-muted-foreground">
                  Ctrl/⌘ + Enter
                </span>
              </div>
              <Textarea
                id="answer"
                ref={inputRef}
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onDraftKeyDown}
                rows={6}
                placeholder="Napiš odpověď vlastními slovy…"
                className="field-sizing-fixed h-36 max-h-36 min-h-36 resize-none overflow-y-auto bg-muted/40 sm:h-44 sm:max-h-44 sm:min-h-44"
              />
            </div>
            <Button type="button" className="mt-4" onClick={check}>
              Zkontrolovat
            </Button>
          </>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="grid items-stretch gap-3 sm:grid-cols-2">
              <div className="flex min-h-0 flex-col rounded-xl bg-muted/60 p-5">
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Tvoje odpověď
                </p>
                <p className="max-h-56 overflow-y-auto text-base leading-relaxed whitespace-pre-wrap">
                  {draft.trim() || '—'}
                </p>
              </div>
              <div className="section-card-answer flex min-h-0 flex-col rounded-xl border p-5">
                <Badge className="mb-2 w-fit border-transparent bg-primary text-primary-foreground">
                  Správná odpověď {cardNumber}
                </Badge>
                <p className="max-h-56 overflow-y-auto font-card text-lg leading-relaxed">
                  {card.answer}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-sm text-muted-foreground">
                Porovnej odpovědi a ohodnoť se:
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="border-know bg-know text-white hover:border-know/90 hover:bg-know/90"
                  onClick={onKnow}
                >
                  Vím
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="border-miss bg-miss text-white hover:border-miss/90 hover:bg-miss/90"
                  onClick={onMiss}
                >
                  Nevím
                </Button>
              </div>
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
  )
}
