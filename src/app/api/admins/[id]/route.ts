import { NextResponse } from "next/server";
import { AuthError, requireOwner } from "@/lib/auth";
import { deleteAdmin, updateAdminPassword } from "@/lib/users";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireOwner();
    const { id } = await params;
    const body = (await request.json()) as { password?: string };
    await updateAdminPassword(id, body.password ?? "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireOwner();
    const { id } = await params;
    await deleteAdmin(id, session.username);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
