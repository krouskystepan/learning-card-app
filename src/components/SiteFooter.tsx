export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 py-4">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-1 px-4 text-xs text-muted-foreground sm:px-6">
        <span>Vytvořil</span>
        <a
          href="https://krouskystepan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
        >
          Štěpán Krouský
        </a>
      </div>
    </footer>
  );
}
