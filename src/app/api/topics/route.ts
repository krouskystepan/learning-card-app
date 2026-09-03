import { NextResponse } from "next/server";
import { AuthError, requireContentAccess, requireSession } from "@/lib/auth";
import {
  createTopic,
  getSectionBySlug,
  ownerUsername,
  parseFlashcards,
  sectionEditors,
} from "@/lib/topics";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      sectionSlug?: string;
      title?: string;
      flashcards?: unknown;
    };

    if (!body.sectionSlug || !body.title) {
      return NextResponse.json(
        { error: "sectionSlug a title jsou povinné" },
        { status: 400 },
      );
    }

    const section = await getSectionBySlug(body.sectionSlug);
    if (!section) {
      return NextResponse.json({ error: "Sekce nenalezena" }, { status: 404 });
    }
    requireContentAccess(
      session,
      await ownerUsername(section.createdBy),
      sectionEditors(section),
    );

    const flashcards = parseFlashcards(body.flashcards ?? []);
    const topic = await createTopic({
      sectionSlug: body.sectionSlug,
      title: body.title,
      flashcards,
      createdBy: session.username,
    });
    return NextResponse.json(topic, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Chyba serveru";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
