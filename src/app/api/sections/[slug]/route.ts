import { NextResponse } from "next/server";
import { AuthError, requireContentAccess, requireDeleteAccess, requireSession } from "@/lib/auth";
import {
  deleteSection,
  getSectionBySlug,
  ownerUsername,
  sectionEditors,
  updateSection,
} from "@/lib/topics";
import {
  normalizeSectionColor,
  normalizeSectionIcon,
} from "@/lib/section-style";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { slug } = await params;
    const section = await getSectionBySlug(slug);
    if (!section) {
      return NextResponse.json({ error: "Sekce nenalezena" }, { status: 404 });
    }
    return NextResponse.json({
      name: section.name,
      slug: section.slug,
      icon: normalizeSectionIcon(section.icon),
      color: normalizeSectionColor(section.color),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { slug } = await params;
    const section = await getSectionBySlug(slug);
    if (!section) {
      return NextResponse.json({ error: "Sekce nenalezena" }, { status: 404 });
    }
    requireContentAccess(
      session,
      await ownerUsername(section.createdBy),
      sectionEditors(section),
    );
    const body = (await request.json()) as {
      name?: string;
      icon?: string;
      color?: string;
    };
    const updated = await updateSection(slug, {
      name: body.name ?? "",
      icon: body.icon,
      color: body.color,
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Chyba serveru";
    const status = message.includes("nenalezena") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { slug } = await params;
    const section = await getSectionBySlug(slug);
    if (!section) {
      return NextResponse.json({ error: "Sekce nenalezena" }, { status: 404 });
    }
    requireDeleteAccess(session, await ownerUsername(section.createdBy));
    await deleteSection(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Chyba serveru";
    const status = message.includes("nenalezena") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
