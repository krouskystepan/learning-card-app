import { notFound, redirect } from "next/navigation";
import { listSections, getSectionBySlug, getTopicDoc, ownerUsername, sectionEditors } from "@/lib/topics";
import { getSession } from "@/lib/auth";
import { canManageContent, sectionCollaborators } from "@/lib/permissions";
import { TopicEditor } from "@/components/TopicEditor";

type Props = {
  params: Promise<{ section: string; topic: string }>;
};

export default async function EditTopicPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { section, topic } = await params;
  const doc = await getTopicDoc(section, topic);
  if (!doc) notFound();
  const parent = await getSectionBySlug(section);
  const canEdit = canManageContent(
    session,
    await ownerUsername(doc.createdBy),
    sectionCollaborators({
      createdBy: await ownerUsername(parent?.createdBy),
      editors: sectionEditors(parent),
    }),
  );
  if (!canEdit) redirect("/");

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
