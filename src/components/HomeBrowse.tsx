'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Search, X } from 'lucide-react'
import type { Section } from '@/lib/topics'
import { canDeleteContent, canManageContent, canManageEditors, sectionCollaborators, type ContentActor } from '@/lib/permissions'
import { sectionColorVars } from '@/lib/section-style'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { SectionActions } from '@/components/SectionAdmin'
import { NewTopicButton, TopicActions } from '@/components/TopicAdmin'
import { SectionBadge } from '@/components/SectionBadge'

function cardLabel(count: number) {
  if (count === 1) return 'kartička'
  if (count < 5) return 'kartičky'
  return 'kartiček'
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

type Props = {
  sections: Section[]
  isEditor: boolean
  viewer: ContentActor | null
}

export function HomeBrowse({ sections, isEditor, viewer }: Props) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const needle = normalize(deferredQuery)

  const filtered = useMemo(() => {
    if (!needle) return sections

    return sections
      .map((section) => {
        const sectionMatch = normalize(section.name).includes(needle)
        const topics = sectionMatch
          ? section.topics
          : section.topics.filter((t) =>
              normalize(t.title).includes(needle)
            )
        if (!sectionMatch && topics.length === 0) return null
        return { ...section, topics }
      })
      .filter((s): s is Section => s !== null)
  }, [sections, needle])

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-7xl px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0">
            <h1 className="font-card text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Vyber si okruh
            </h1>
            <p className="mt-2 max-w-xl text-base text-muted-foreground sm:mt-3 sm:text-lg">
              {isEditor
                ? viewer?.role === 'owner'
                  ? 'Jsi hlavní admin - můžeš spravovat vše a přidávat editory ke sekcím.'
                  : 'Můžeš vytvářet obsah, spravovat to své a u svých sekcí přidávat další editory.'
                : 'Vyber téma a začni se učit.'}
            </p>
          </div>

          <div className="relative w-full max-w-md shrink-0 lg:pb-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat sekci nebo téma…"
              aria-label="Hledat sekci nebo téma"
              className="h-9 pr-9 pl-8"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute top-1/2 right-1.5 -translate-y-1/2"
                onClick={() => setQuery('')}
                aria-label="Vymazat hledání"
              >
                <X />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 pb-20 sm:space-y-8 sm:px-6 sm:pb-24">
        {filtered.map((section) => (
          <section
            key={section.slug}
            className="section-surface section-theme space-y-3 rounded-2xl border p-3 sm:space-y-4 sm:p-5"
            style={sectionColorVars(section.color)}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <SectionBadge icon={section.icon} color={section.color} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-card text-xl font-semibold tracking-tight sm:text-2xl">
                    {section.name}
                  </h2>
                  {canManageContent(
                    viewer,
                    section.createdBy,
                    section.editors
                  ) && (
                    <SectionActions
                      slug={section.slug}
                      name={section.name}
                      icon={section.icon}
                      color={section.color}
                      canShare={canManageEditors(viewer, section.createdBy)}
                      canDelete={canDeleteContent(viewer, section.createdBy)}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {section.topics.length}{' '}
                  {section.topics.length === 1
                    ? 'téma'
                    : section.topics.length < 5
                      ? 'témata'
                      : 'témat'}
                </p>
              </div>
              {canManageContent(
                viewer,
                section.createdBy,
                section.editors
              ) && (
                <div className="ml-auto">
                  <NewTopicButton sectionSlug={section.slug} />
                </div>
              )}
            </div>

            {section.topics.length === 0 ? (
              canManageContent(
                viewer,
                section.createdBy,
                section.editors
              ) ? (
                <p className="pl-12 text-sm text-muted-foreground">
                  Zatím žádná témata - vytvoř první.
                </p>
              ) : null
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                {section.topics.map((topic) => (
                  <article
                    key={`${section.slug}-${topic.slug}`}
                    className="section-topic flex flex-col gap-2.5 rounded-xl px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3"
                  >
                    <h3 className="font-card line-clamp-2 text-sm leading-snug font-semibold tracking-tight sm:text-base lg:text-lg">
                      <Link
                        href={`/study/${section.slug}/${topic.slug}`}
                        className="hover:text-primary"
                        title={topic.title}
                      >
                        {topic.title}
                      </Link>
                    </h3>
                    <div className="mt-auto flex items-center gap-2">
                      <Button asChild size="sm">
                        <Link href={`/study/${section.slug}/${topic.slug}`}>
                          <BookOpen data-icon="inline-start" />
                          Učit se
                        </Link>
                      </Button>
                      <p className="ml-auto text-xs text-muted-foreground tabular-nums sm:text-sm">
                        {topic.cardCount} {cardLabel(topic.cardCount)}
                      </p>
                      {(canManageContent(
                        viewer,
                        topic.createdBy,
                        sectionCollaborators(section)
                      ) ||
                        canDeleteContent(viewer, topic.createdBy) ||
                        canDeleteContent(viewer, section.createdBy)) && (
                        <TopicActions
                          sectionSlug={section.slug}
                          topicSlug={topic.slug}
                          title={topic.title}
                          canDelete={
                            canDeleteContent(viewer, topic.createdBy) ||
                            canDeleteContent(viewer, section.createdBy)
                          }
                        />
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}

        {sections.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Žádné sekce</CardTitle>
              <CardDescription>
                {isEditor
                  ? 'Vytvoř první sekci tlačítkem „Nová sekce“.'
                  : 'Zatím tu nic není. Přihlas se a přidej obsah.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {sections.length > 0 && filtered.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Nic nenalezeno</CardTitle>
              <CardDescription>
                Pro „{query.trim()}“ se nenašla žádná sekce ani téma.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  )
}
