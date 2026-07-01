import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { user, profile, signOut, loading } = useAuth();
  const displayName =
    profile?.full_name?.trim() || user?.email?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-sm">
            ih
          </span>
          <span>Interhub</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/browse"
            className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "rounded-full px-3 py-1.5 bg-secondary text-foreground" }}
          >
            Browse
          </Link>

          {loading ? null : user ? (
            <>
              <Link
                to="/saved"
                className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "rounded-full px-3 py-1.5 bg-secondary text-foreground" }}
              >
                My Saved
              </Link>
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "rounded-full px-3 py-1.5 bg-secondary text-foreground" }}
                >
                  Admin
                </Link>
              )}
              <span className="hidden max-w-[10ch] truncate px-2 text-xs text-muted-foreground sm:inline">
                {displayName}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="rounded-full bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
