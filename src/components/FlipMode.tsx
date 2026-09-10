'use client'

import type { Flashcard } from '@/lib/topics'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { FitText } from '@/components/FitText'
import { useFlipCard } from '@/hooks/use-flip-card'

type Props = {
  card: Flashcard
  cardNumber: number
  onPrev: () => void
  onNext: () => void
}

export function FlipMode({ card, cardNumber, onPrev, onNext }: Props) {
  const { flipped, toggle } = useFlipCard(onPrev, onNext)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <button
        type="button"
        onClick={toggle}
        className="flip-scene w-full text-left outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
        aria-label={flipped ? 'Zobrazit otázku' : 'Zobrazit odpověď'}
      >
        <div
          className={`flip-card relative h-80 w-full sm:h-100 ${
            flipped ? 'is-flipped' : ''
          }`}
        >
          <Card className="section-card flip-face absolute inset-0 flex flex-col gap-0 px-5 py-6 shadow-lg ring-0 sm:px-8 sm:py-8">
            <Badge className="w-fit shrink-0 border-transparent bg-primary/15 text-primary">
              Otázka {cardNumber}
            </Badge>
            <FitText maxPx={30} className="leading-snug">
              {card.question}
            </FitText>
            <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
              Klikni nebo stiskni mezerník pro překlopení
            </span>
          </Card>
          <Card className="section-card-answer flip-face flip-face-back absolute inset-0 flex flex-col gap-0 px-5 py-6 shadow-lg ring-0 sm:px-8 sm:py-8">
            <Badge className="w-fit shrink-0 border-transparent bg-primary text-primary-foreground">
              Odpověď {cardNumber}
            </Badge>
            <FitText maxPx={24} className="leading-relaxed">
              {card.answer}
            </FitText>
            <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
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
  )
}
