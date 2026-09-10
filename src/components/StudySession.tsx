'use client'

import Link from 'next/link'
import { ArrowLeft, Shuffle } from 'lucide-react'
import type { Flashcard } from '@/lib/topics'
import { sectionColorVars, type SectionColorId } from '@/lib/section-style'
import { FlipMode } from '@/components/FlipMode'
import { TypeMode } from '@/components/TypeMode'
import { TypeResults } from '@/components/TypeResults'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useStudySession } from '@/hooks/use-study-session'

type Props = {
  title: string
  flashcards: Flashcard[]
  color: SectionColorId
}

export function StudySession({ title, flashcards, color }: Props) {
  const session = useStudySession(flashcards)

  if (!session.current) {
    return (
      <p className="p-8 text-muted-foreground">Toto téma nemá žádné kartičky.</p>
    )
  }

  return (
    <div
      className="section-theme mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10"
      style={sectionColorVars(color)}
    >
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" />
              Zpět na okruhy
            </Link>
          </Button>
          <h1 className="font-card text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
        </div>

        <ToggleGroup
          type="single"
          value={session.mode}
          onValueChange={(value) => {
            if (value === 'flip' || value === 'type') session.setMode(value)
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

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <p className="text-sm text-muted-foreground">
          {session.mode === 'type' && session.showResults ? (
            'Hotovo'
          ) : (
            <>
              Kartička{' '}
              <span className="font-semibold text-foreground">
                {session.index + 1}
              </span>{' '}
              z {session.total}
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {session.orderMode === 'random' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={session.reshuffle}
              title="Znovu zamíchat"
              className="max-sm:px-2"
            >
              <Shuffle />
              <span className="hidden sm:inline">Zamíchat znovu</span>
            </Button>
          )}

          <ToggleGroup
            type="single"
            value={session.orderMode}
            onValueChange={(value) => {
              if (value === 'sequential' || value === 'random') {
                session.setOrderMode(value)
              }
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Pořadí kartiček"
          >
            <ToggleGroupItem
              value="sequential"
              className="px-2.5 data-[state=on]:bg-primary/15 data-[state=on]:text-primary sm:px-3"
            >
              Postupně
            </ToggleGroupItem>
            <ToggleGroupItem
              value="random"
              className="px-2.5 data-[state=on]:bg-primary/15 data-[state=on]:text-primary sm:px-3"
            >
              Náhodně
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <Progress value={session.progress} className="mb-8 h-1.5" />

      <div className="flex-1">
        {session.mode === 'flip' ? (
          <FlipMode
            key={session.cardKey}
            card={session.current}
            cardNumber={session.cardNumber}
            onPrev={session.goPrev}
            onNext={session.goNext}
          />
        ) : session.showResults ? (
          <TypeResults
            total={session.total}
            grades={session.grades}
            onRetry={session.retry}
          />
        ) : (
          <TypeMode
            key={session.cardKey}
            card={session.current}
            cardNumber={session.cardNumber}
            onPrev={session.goPrev}
            onNext={session.goNext}
            onKnow={session.gradeKnow}
            onMiss={session.gradeMiss}
          />
        )}
      </div>
    </div>
  )
}
