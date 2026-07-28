import { notFound } from "next/navigation";
import { listSections, getTopicDoc } from "@/lib/topics";
import { TopicEditor } from "@/components/TopicEditor";

type Props = {
  params: Promise<{ section: string; topic: string }>;
};

export default async function EditTopicPage({ params }: Props) {
  const { section, topic } = await params;
  const doc = await getTopicDoc(section, topic);
  if (!doc) notFound();

  const sections = await listSections();

  return (
    <TopicEditor
      mode="edit"
      sectionSlug={doc.sectionSlug}
      initialSlug={doc.slug}
      initialTitle={doc.title}
      initialFlashcards={doc.flashcards}
      sections={sections.map((s) => ({ slug: s.slug, name: s.name }))}
    />
  );
}
