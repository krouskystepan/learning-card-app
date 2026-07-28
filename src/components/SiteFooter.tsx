export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-1.5 px-6 text-sm text-muted-foreground">
        <span>Vytvořil</span>
        <a
          href="https://krouskystepan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
        >
          Štěpán Krouský
        </a>
      </div>
    </footer>
  );
}
