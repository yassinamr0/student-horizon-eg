import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-sm">SO</span>
          <span className="hidden sm:inline">Student Opportunities Egypt</span>
          <span className="sm:hidden">SO Egypt</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/browse"
            className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "rounded-full px-3 py-1.5 bg-secondary text-foreground" }}
          >
            Browse
          </Link>
        </nav>
      </div>
    </header>
  );
}
