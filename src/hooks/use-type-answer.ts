'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

export function useTypeAnswer() {
  const [draft, setDraft] = useState('')
  const [revealed, setRevealed] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function check() {
    setRevealed(true)
  }

  function onDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      check()
    }
  }

  return {
    draft,
    setDraft,
    revealed,
    inputRef,
    check,
    onDraftKeyDown
  }
}
