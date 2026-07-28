import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/lib/auth";
import {
  deleteTopic,
  getTopicDoc,
  parseFlashcards,
  updateTopic,
} from "@/lib/topics";

type Ctx = {
  params: Promise<{ section: string; topic: string }>;
};

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { section, topic } = await params;
    const doc = await getTopicDoc(section, topic);
    if (!doc) {
      return NextResponse.json({ error: "Téma nenalezeno" }, { status: 404 });
    }
    return NextResponse.json({
      sectionSlug: doc.sectionSlug,
      slug: doc.slug,
      title: doc.title,
      flashcards: doc.flashcards,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    await requireSession();
    const { section, topic } = await params;
    const body = (await request.json()) as {
      title?: string;
      flashcards?: unknown;
    };

    const updated = await updateTopic(section, topic, {
      title: body.title,
      flashcards:
        body.flashcards !== undefined
          ? parseFlashcards(body.flashcards)
          : undefined,
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Chyba serveru";
    const status = message.includes("nenalezeno") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requireSession();
    const { section, topic } = await params;
    await deleteTopic(section, topic);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Chyba serveru";
    const status = message.includes("nenalezeno") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
