import { listSections } from '@/lib/topics'
import { getSession } from '@/lib/auth'
import { HomeBrowse } from '@/components/HomeBrowse'

export default async function Home() {
  const [sections, session] = await Promise.all([listSections(), getSession()])
  const isEditor = !!session
  const visibleSections = isEditor
    ? sections
    : sections.filter((s) => s.topics.length > 0)

  return <HomeBrowse sections={visibleSections} isEditor={isEditor} />
}
