import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/lib/auth";
import { createSection, listSections } from "@/lib/topics";

export async function GET() {
  try {
    const data = await listSections();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      name?: string;
      icon?: string;
      color?: string;
    };
    const section = await createSection({
      name: body.name ?? "",
      icon: body.icon,
      color: body.color,
      createdBy: session.username,
    });
    return NextResponse.json(section, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Chyba serveru";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
