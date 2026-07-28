import { notFound } from "next/navigation";
import { getSectionBySlug, loadTopic } from "@/lib/topics";
import { normalizeSectionColor } from "@/lib/section-style";
import { StudySession } from "@/components/StudySession";

type Props = {
  params: Promise<{ section: string; topic: string }>;
};

export const dynamic = "force-dynamic";

export default async function StudyPage({ params }: Props) {
  const { section: sectionSlug, topic: topicSlug } = await params;

  let topic;
  try {
    topic = await loadTopic(sectionSlug, topicSlug);
  } catch {
    notFound();
  }

  const section = await getSectionBySlug(sectionSlug);
  const color = normalizeSectionColor(section?.color);

  return (
    <StudySession
      title={topic.title}
      flashcards={topic.flashcards}
      color={color}
    />
  );
}
