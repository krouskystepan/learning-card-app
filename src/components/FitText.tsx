'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: string
  className?: string
  /** Largest font size in px (desktop). */
  maxPx: number
  /** Smallest font size in px. */
  minPx?: number
}

/**
 * Shrinks font size until the text fits the parent box.
 * No scrolling - overflows are clipped only if still too long at minPx.
 */
export function FitText({ children, className, maxPx, minPx = 13 }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const [size, setSize] = useState(maxPx)

  useLayoutEffect(() => {
    const box = boxRef.current
    const el = textRef.current
    if (!box || !el) return

    const fit = () => {
      const mobile = window.matchMedia('(max-width: 639px)').matches
      const ceiling = mobile ? Math.min(maxPx, Math.round(maxPx * 0.72)) : maxPx

      for (let s = ceiling; s >= minPx; s -= 1) {
        el.style.fontSize = `${s}px`
        if (
          el.scrollHeight <= box.clientHeight &&
          el.scrollWidth <= box.clientWidth
        ) {
          setSize(s)
          return
        }
      }
      el.style.fontSize = `${minPx}px`
      setSize(minPx)
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [children, maxPx, minPx])

  return (
    <div
      ref={boxRef}
      className="flex min-h-0 flex-1 items-center overflow-hidden py-5 sm:py-6"
    >
      <p
        ref={textRef}
        className={cn('font-card w-full font-medium', className)}
        style={{ fontSize: size }}
      >
        {children}
      </p>
    </div>
  )
}
