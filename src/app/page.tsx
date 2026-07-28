import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { listSections } from '@/lib/topics'
import { getSession } from '@/lib/auth'
import { sectionColorVars } from '@/lib/section-style'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SectionActions } from '@/components/SectionAdmin'
import { NewTopicButton, TopicActions } from '@/components/TopicAdmin'
import { SectionBadge } from '@/components/SectionBadge'

function cardLabel(count: number) {
  if (count === 1) return 'kartička'
  if (count < 5) return 'kartičky'
  return 'kartiček'
}

export default async function Home() {
  const [sections, session] = await Promise.all([listSections(), getSession()])
  const isEditor = !!session
  const visibleSections = isEditor
    ? sections
    : sections.filter((s) => s.topics.length > 0)

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 pt-10 pb-8">
        <h1 className="font-card text-4xl font-semibold tracking-tight sm:text-5xl">
          Vyber si okruh
        </h1>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">
          {isEditor
            ? 'Jsi přihlášený - můžeš vytvářet, upravovat a mazat sekce i témata.'
            : 'Vyber téma a začni se učit.'}
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-6 pb-24">
        {visibleSections.map((section) => (
          <section
            key={section.slug}
            className="section-surface section-theme space-y-4 rounded-2xl border p-4 sm:p-5"
            style={sectionColorVars(section.color)}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <SectionBadge icon={section.icon} color={section.color} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-card text-2xl font-semibold tracking-tight">
                    {section.name}
                  </h2>
                  {isEditor && (
                    <SectionActions
                      slug={section.slug}
                      name={section.name}
                      icon={section.icon}
                      color={section.color}
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {section.topics.length}{' '}
                  {section.topics.length === 1
                    ? 'téma'
                    : section.topics.length < 5
                      ? 'témata'
                      : 'témat'}
                </p>
              </div>
              {isEditor && (
                <div className="ml-auto">
                  <NewTopicButton sectionSlug={section.slug} />
                </div>
              )}
            </div>

            {section.topics.length === 0 ? (
              isEditor ? (
                <p className="pl-12 text-sm text-muted-foreground">
                  Zatím žádná témata - vytvoř první.
                </p>
              ) : null
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3">
                {section.topics.map((topic) => (
                  <article
                    key={`${section.slug}-${topic.slug}`}
                    className="section-topic flex flex-col gap-3 rounded-xl px-3.5 py-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-card text-base leading-snug font-semibold tracking-tight sm:text-lg">
                        <Link
                          href={`/study/${section.slug}/${topic.slug}`}
                          className="hover:text-primary"
                        >
                          {topic.title}
                        </Link>
                      </h3>
                      {isEditor && (
                        <TopicActions
                          sectionSlug={section.slug}
                          topicSlug={topic.slug}
                          title={topic.title}
                        />
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <Button asChild size="sm">
                        <Link href={`/study/${section.slug}/${topic.slug}`}>
                          <BookOpen data-icon="inline-start" />
                          Učit se
                        </Link>
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        {topic.cardCount} {cardLabel(topic.cardCount)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}

        {visibleSections.length === 0 && (
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
      </main>
    </div>
  )
}
