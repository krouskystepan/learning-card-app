import { NextResponse } from "next/server";
import { AuthError, requireEditorsAccess, requireSession } from "@/lib/auth";
import { getSectionBySlug, ownerUsername, sectionEditors, updateSectionEditors } from "@/lib/topics";
import { listUsernames, isMainAdminUsername } from "@/lib/users";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { slug } = await params;
    const section = await getSectionBySlug(slug);
    if (!section) {
      return NextResponse.json({ error: "Sekce nenalezena" }, { status: 404 });
    }
    const createdBy = await ownerUsername(section.createdBy);
    requireEditorsAccess(session, createdBy);
    const usernames = await listUsernames();
    return NextResponse.json({
      editors: sectionEditors(section).filter((name) => !isMainAdminUsername(name)),
      createdBy,
      users: usernames.filter(
        (name) => name !== createdBy && !isMainAdminUsername(name),
      ),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Chyba serveru";
    const status = message.includes("nenalezena") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const session = await requireSession();
    const { slug } = await params;
    const section = await getSectionBySlug(slug);
    if (!section) {
      return NextResponse.json({ error: "Sekce nenalezena" }, { status: 404 });
    }
    requireEditorsAccess(session, await ownerUsername(section.createdBy));
    const body = (await request.json()) as { editors?: unknown };
    const updated = await updateSectionEditors(slug, body.editors ?? []);
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
