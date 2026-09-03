import { redirect } from "next/navigation";
import { listSections } from "@/lib/topics";
import { getSession } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { TopicEditor } from "@/components/TopicEditor";

type Props = {
  searchParams: Promise<{ section?: string }>;
};

export default async function NewTopicPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin/topics/new");

  const { section: sectionParam } = await searchParams;
  const sections = await listSections();
  const allowed = sections.filter((s) =>
    canManageContent(session, s.createdBy, s.editors),
  );

  if (allowed.length === 0) {
    redirect("/");
  }

  const sectionSlug =
    allowed.find((s) => s.slug === sectionParam)?.slug ?? allowed[0].slug;

  return (
    <TopicEditor
      mode="create"
      sectionSlug={sectionSlug}
      sections={allowed.map((s) => ({ slug: s.slug, name: s.name }))}
    />
  );
}
