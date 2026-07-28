import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col px-6 py-20">
      <h1 className="font-card text-3xl font-semibold">Téma nenalezeno</h1>
      <p className="mt-3 text-muted-foreground">
        Zkontroluj slug nebo přidej odpovídající JSON do složky content.
      </p>
      <Button asChild variant="link" className="mt-6 w-fit px-0">
        <Link href="/">← Zpět na okruhy</Link>
      </Button>
    </div>
  );
}
