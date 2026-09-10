'use client'

import { useCallback, useMemo, useReducer } from 'react'
import type { Flashcard } from '@/lib/topics'

export type StudyMode = 'flip' | 'type'
export type OrderMode = 'sequential' | 'random'
export type Grade = 'know' | 'miss' | null

type StudyState = {
  mode: StudyMode
  orderMode: OrderMode
  order: number[]
  index: number
  grades: Grade[]
  showResults: boolean
}

type StudyAction =
  | { type: 'setMode'; mode: StudyMode }
  | { type: 'setOrderMode'; orderMode: OrderMode }
  | { type: 'reshuffle' }
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'grade'; grade: Exclude<Grade, null> }
  | { type: 'retry' }

function sequentialOrder(count: number) {
  return Array.from({ length: count }, (_, i) => i)
}

function emptyGrades(count: number): Grade[] {
  return Array.from({ length: count }, () => null)
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function orderFor(orderMode: OrderMode, count: number) {
  const base = sequentialOrder(count)
  return orderMode === 'random' ? shuffle(base) : base
}

function resetRound(state: StudyState, order: number[]): StudyState {
  return {
    ...state,
    order,
    index: 0,
    grades: emptyGrades(order.length),
    showResults: false
  }
}

function finishOrAdvance(state: StudyState): StudyState {
  if (state.index >= state.order.length - 1) {
    return { ...state, showResults: true }
  }
  return { ...state, index: state.index + 1 }
}

function createInitialState(count: number): StudyState {
  return {
    mode: 'flip',
    orderMode: 'sequential',
    order: sequentialOrder(count),
    index: 0,
    grades: emptyGrades(count),
    showResults: false
  }
}

function studyReducer(state: StudyState, action: StudyAction): StudyState {
  const count = state.order.length

  switch (action.type) {
    case 'setMode':
      if (action.mode === state.mode) return state
      return { ...resetRound(state, state.order), mode: action.mode }

    case 'setOrderMode':
      if (action.orderMode === state.orderMode && action.orderMode === 'sequential') {
        return state
      }
      return {
        ...resetRound(state, orderFor(action.orderMode, count)),
        orderMode: action.orderMode
      }

    case 'reshuffle':
      if (state.orderMode !== 'random') return state
      return resetRound(state, shuffle(sequentialOrder(count)))

    case 'prev':
      if (state.mode === 'type') {
        return { ...state, index: Math.max(0, state.index - 1) }
      }
      return {
        ...state,
        index: state.index > 0 ? state.index - 1 : count - 1
      }

    case 'next':
      if (state.mode === 'type') return finishOrAdvance(state)
      return {
        ...state,
        index: state.index < count - 1 ? state.index + 1 : 0
      }

    case 'grade': {
      const grades = [...state.grades]
      grades[state.index] = action.grade
      return finishOrAdvance({ ...state, grades })
    }

    case 'retry':
      return resetRound(
        state,
        state.orderMode === 'random'
          ? shuffle(sequentialOrder(count))
          : state.order
      )
  }
}

export function useStudySession(flashcards: Flashcard[]) {
  const [state, dispatch] = useReducer(
    studyReducer,
    flashcards.length,
    createInitialState
  )

  const cards = useMemo(
    () => state.order.map((i) => flashcards[i]),
    [flashcards, state.order]
  )

  const current = cards[state.index]
  const total = cards.length
  const progress =
    state.mode === 'type' && state.showResults
      ? 100
      : total === 0
        ? 0
        : ((state.index + 1) / total) * 100

  const setMode = useCallback((mode: StudyMode) => {
    dispatch({ type: 'setMode', mode })
  }, [])

  const setOrderMode = useCallback((orderMode: OrderMode) => {
    dispatch({ type: 'setOrderMode', orderMode })
  }, [])

  const reshuffle = useCallback(() => {
    dispatch({ type: 'reshuffle' })
  }, [])

  const goPrev = useCallback(() => {
    dispatch({ type: 'prev' })
  }, [])

  const goNext = useCallback(() => {
    dispatch({ type: 'next' })
  }, [])

  const gradeKnow = useCallback(() => {
    dispatch({ type: 'grade', grade: 'know' })
  }, [])

  const gradeMiss = useCallback(() => {
    dispatch({ type: 'grade', grade: 'miss' })
  }, [])

  const retry = useCallback(() => {
    dispatch({ type: 'retry' })
  }, [])

  return {
    mode: state.mode,
    orderMode: state.orderMode,
    index: state.index,
    grades: state.grades,
    showResults: state.showResults,
    current,
    total,
    progress,
    cardNumber: current ? state.order[state.index] + 1 : 0,
    cardKey: `${state.mode}-${state.order.join('-')}-${state.index}`,
    setMode,
    setOrderMode,
    reshuffle,
    goPrev,
    goNext,
    gradeKnow,
    gradeMiss,
    retry
  }
}
