import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <Suspense fallback={<div className="text-muted-foreground">Načítám…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
