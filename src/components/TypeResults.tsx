'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Grade } from '@/hooks/use-study-session'

type Props = {
  total: number
  grades: Grade[]
  onRetry: () => void
}

export function TypeResults({ total, grades, onRetry }: Props) {
  const know = grades.filter((grade) => grade === 'know').length
  const miss = grades.filter((grade) => grade === 'miss').length
  const skipped = total - know - miss
  const percent = total === 0 ? 0 : Math.round((know / total) * 100)

  return (
    <Card className="section-card gap-0 p-5 text-center shadow-lg ring-0 sm:p-8">
      <p className="text-sm font-medium text-muted-foreground">Výsledek</p>
      <p className="mt-4 font-card text-5xl font-semibold tracking-tight sm:text-6xl">
        {percent}&nbsp;%
      </p>
      <p className="mt-3 text-lg">
        <span className="font-semibold">{know}</span> z {total} správně
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Vím {know}
        <span className="mx-2">·</span>
        Nevím {miss}
        {skipped > 0 && (
          <>
            <span className="mx-2">·</span>
            Přeskočeno {skipped}
          </>
        )}
      </p>
      <Button type="button" className="mt-8" onClick={onRetry}>
        Zkusit znovu
      </Button>
    </Card>
  )
}
