import { redirect } from "next/navigation";
import { listSections } from "@/lib/topics";
import { TopicEditor } from "@/components/TopicEditor";

type Props = {
  searchParams: Promise<{ section?: string }>;
};

export default async function NewTopicPage({ searchParams }: Props) {
  const { section: sectionParam } = await searchParams;
  const sections = await listSections();

  if (sections.length === 0) {
    redirect("/");
  }

  const sectionSlug =
    sections.find((s) => s.slug === sectionParam)?.slug ?? sections[0].slug;

  return (
    <TopicEditor
      mode="create"
      sectionSlug={sectionSlug}
      sections={sections.map((s) => ({ slug: s.slug, name: s.name }))}
    />
  );
}
