'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Flashcard } from '@/lib/topics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChatGptTemplate } from '@/components/ChatGptTemplate'
import { JSON_TEMPLATE_EXAMPLE } from '@/lib/chatgpt-template'
import { cn } from '@/lib/utils'
import { parseJsonObject } from '@/lib/parse-json'
import {
  EMPTY_CARD,
  toEditorCards,
  toPersistCards,
  topicFormSchema,
  topicPayloadSchema,
  type TopicFormValues
} from '@/lib/topic-schema'
import { toast } from 'sonner'

type Mode = 'form' | 'json'

type Props = {
  mode: 'create' | 'edit'
  sectionSlug: string
  initialSlug?: string
  initialTitle?: string
  initialFlashcards?: Flashcard[]
  sections: { slug: string; name: string }[]
}

const selectClass =
  'h-8 w-full appearance-none rounded-lg border border-input bg-transparent py-1 pr-8 pl-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30'

export function TopicEditor({
  mode,
  sectionSlug: initialSection,
  initialSlug = '',
  initialTitle = '',
  initialFlashcards = [EMPTY_CARD],
  sections
}: Props) {
  const router = useRouter()
  const [editorMode, setEditorMode] = useState<Mode>('form')
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(
      {
        title: initialTitle || 'Název tématu',
        flashcards: initialFlashcards.length
          ? initialFlashcards
          : [{ question: 'Otázka?', answer: 'Odpověď.' }]
      },
      null,
      2
    )
  )

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      sectionSlug: initialSection,
      title: initialTitle,
      flashcards: toEditorCards(initialFlashcards)
    }
  })

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting, errors }
  } = form

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: 'flashcards'
  })

  const flashcards = useWatch({ control, name: 'flashcards' })
  const cardCount = (flashcards ?? []).filter(
    (c) => c.question.trim() || c.answer.trim()
  ).length

  const heading = mode === 'create' ? 'Nové téma' : 'Upravit téma'

  function syncFormToJson() {
    const values = getValues()
    setJsonText(
      JSON.stringify(
        {
          title: values.title,
          flashcards: toPersistCards(values.flashcards)
        },
        null,
        2
      )
    )
  }

  function applyJsonToForm(): boolean {
    try {
      const parsed = topicPayloadSchema.parse(parseJsonObject(jsonText))
      setValue('title', parsed.title, { shouldValidate: true })
      if (parsed.sectionSlug) {
        setValue('sectionSlug', parsed.sectionSlug, { shouldValidate: true })
      }
      setValue('flashcards', toEditorCards(parsed.flashcards), {
        shouldValidate: true
      })
      return true
    } catch {
      toast.error('Neplatný JSON - zkontroluj formát nebo zkus uložit znovu')
      return false
    }
  }

  function switchMode(next: Mode) {
    if (next === editorMode) return
    if (next === 'json') {
      syncFormToJson()
      setEditorMode('json')
      return
    }
    if (applyJsonToForm()) setEditorMode('form')
  }

  async function savePayload(payload: {
    sectionSlug: string
    title: string
    flashcards: Flashcard[]
  }) {
    if (!payload.flashcards.length) {
      toast.error('Přidej alespoň jednu kartičku s otázkou i odpovědí')
      return
    }

    try {
      const res =
        mode === 'create'
          ? await fetch('/api/topics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
          : await fetch(`/api/topics/${initialSection}/${initialSlug}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: payload.title,
                flashcards: payload.flashcards
              })
            })

      const data = (await res.json()) as {
        error?: string
        sectionSlug?: string
        slug?: string
      }
      if (!res.ok) {
        toast.error(data.error || 'Uložení selhalo')
        return
      }

      toast.success(mode === 'create' ? 'Téma vytvořeno' : 'Téma uloženo')
      const nextSection = data.sectionSlug || payload.sectionSlug
      const nextSlug = data.slug || initialSlug
      router.push(`/admin/topics/${nextSection}/${nextSlug}`)
      router.refresh()
    } catch {
      toast.error('Síťová chyba')
    }
  }

  const onFormSubmit = handleSubmit(async (values) => {
    await savePayload({
      sectionSlug: values.sectionSlug,
      title: values.title,
      flashcards: toPersistCards(values.flashcards)
    })
  })

  async function onJsonSubmit() {
    try {
      const parsed = topicPayloadSchema.parse(parseJsonObject(jsonText))
      await savePayload({
        sectionSlug: parsed.sectionSlug || getValues('sectionSlug'),
        title: parsed.title,
        flashcards: toPersistCards(toEditorCards(parsed.flashcards))
      })
    } catch {
      toast.error('Neplatný JSON - zkontroluj formát nebo zkus uložit znovu')
    }
  }

  return (
    <form
      onSubmit={
        editorMode === 'form'
          ? onFormSubmit
          : (e) => {
              e.preventDefault()
              void onJsonSubmit()
            }
      }
      className="flex flex-1 flex-col"
    >
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 pt-8 pb-6">
        <header className="mb-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">
              Přehled
            </Link>
            <span className="mx-1.5 text-border">/</span>
            {heading}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-card text-3xl font-semibold tracking-tight sm:text-4xl">
                {heading}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {editorMode === 'form'
                  ? 'Vyplň kartičky ručně, nebo přepni na JSON.'
                  : 'Vlož JSON od ChatGPT - nebo použij šablonu níže.'}
              </p>
            </div>

            <ToggleGroup
              type="single"
              value={editorMode}
              onValueChange={(v) => v && switchMode(v as Mode)}
              variant="outline"
              className="shrink-0"
            >
              <ToggleGroupItem value="form">Formulář</ToggleGroupItem>
              <ToggleGroupItem value="json">JSON</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </header>

        {editorMode === 'form' ? (
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section">Sekce</Label>
                <div className="relative">
                  <select
                    id="section"
                    className={selectClass}
                    disabled={mode === 'edit'}
                    {...register('sectionSlug')}
                  >
                    {sections.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                {errors.sectionSlug && (
                  <p className="text-sm text-destructive">
                    {errors.sectionSlug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Název tématu</Label>
                <Input id="title" {...register('title')} />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-card text-lg font-semibold">
                  Kartičky
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {cardCount}
                  </span>
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => prepend(EMPTY_CARD)}
                >
                  <Plus data-icon="inline-start" />
                  Přidat
                </Button>
              </div>

              {errors.flashcards?.root && (
                <p className="text-sm text-destructive">
                  {errors.flashcards.root.message}
                </p>
              )}
              {typeof errors.flashcards?.message === 'string' && (
                <p className="text-sm text-destructive">
                  {errors.flashcards.message}
                </p>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const displayNumber = fields.length - index
                  return (
                    <div
                      key={field.id}
                      className={cn(
                        'rounded-xl border p-4',
                        index % 2 === 0
                          ? 'border-primary/15 bg-primary/6'
                          : 'border-border bg-card'
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Kartička {displayNumber}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                          aria-label="Odstranit kartičku"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`q-${field.id}`}>Otázka</Label>
                          <Textarea
                            id={`q-${field.id}`}
                            rows={3}
                            className="field-sizing-fixed max-h-40 min-h-18 resize-y overflow-y-auto bg-background/80"
                            {...register(`flashcards.${index}.question`)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`a-${field.id}`}>Odpověď</Label>
                          <Textarea
                            id={`a-${field.id}`}
                            rows={3}
                            className="field-sizing-fixed max-h-40 min-h-18 resize-y overflow-y-auto bg-background/80"
                            {...register(`flashcards.${index}.answer`)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <ChatGptTemplate />

            <div className="space-y-3">
              {mode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="json-section">Sekce</Label>
                  <div className="relative">
                    <select
                      id="json-section"
                      className={selectClass}
                      {...register('sectionSlug')}
                    >
                      {sections.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="json">JSON</Label>
                <Textarea
                  id="json"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="field-sizing-fixed max-h-[60vh] min-h-90 overflow-y-auto font-mono text-sm"
                  placeholder={JSON_TEMPLATE_EXAMPLE}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-border/70 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2 px-6 py-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Ukládám…'
              : mode === 'create'
                ? 'Vytvořit'
                : 'Uložit'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/">Zrušit</Link>
          </Button>
          {mode === 'edit' && initialSlug && (
            <Button type="button" variant="ghost" asChild>
              <Link href={`/study/${initialSection}/${initialSlug}`}>
                Otevřít studium
              </Link>
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
