import { NextResponse } from "next/server";
import { AuthError, requireOwner } from "@/lib/auth";
import { createAdmin, listAdmins } from "@/lib/users";

export async function GET() {
  try {
    await requireOwner();
    const admins = await listAdmins();
    return NextResponse.json({ admins });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner();
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    const admin = await createAdmin({
      username: body.username ?? "",
      password: body.password ?? "",
    });
    return NextResponse.json({ admin }, { status: 201 });
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
