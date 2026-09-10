'use client'

import { useEffect, useState } from 'react'

export function useFlipCard(onPrev: () => void, onNext: () => void) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        setFlipped((open) => !open)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrev, onNext])

  return {
    flipped,
    toggle: () => setFlipped((open) => !open)
  }
}
