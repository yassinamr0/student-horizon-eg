import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const navLink =
  "font-sans text-[15px] font-medium text-muted-foreground px-1 py-4 border-b-2 border-transparent transition-all duration-[180ms] ease-out hover:text-foreground";
const activeNavLink =
  "font-sans text-[15px] font-medium text-foreground px-1 py-4 border-b-2 border-[color:var(--color-brand)]";

export function SiteHeader() {
  const { user, profile, signOut, loading } = useAuth();
  const displayName =
    profile?.full_name?.trim() || user?.email?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[color:var(--color-brand)] font-display text-sm font-bold text-white">
            ih
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
            Interhub
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/browse" className={navLink} activeProps={{ className: activeNavLink }}>
            Browse
          </Link>
          <Link to="/submit" className={navLink} activeProps={{ className: activeNavLink }}>
            Post a Listing
          </Link>
          {user && (
            <Link to="/saved" className={navLink} activeProps={{ className: activeNavLink }}>
              My Saved
            </Link>
          )}
          {profile?.role === "admin" && (
            <Link to="/admin" className={navLink} activeProps={{ className: activeNavLink }}>
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <span className="hidden max-w-[14ch] truncate font-sans text-[13px] text-muted-foreground sm:inline">
                {displayName}
              </span>
              <button onClick={() => signOut()} className="btn-outline h-9 px-3 text-[13px]">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="btn-outline h-9 px-3 text-[13px]">
                Sign In
              </Link>
              <Link to="/sign-up" className="btn-secondary h-9 px-3 text-[13px]">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-2 md:hidden">
        <Link to="/browse" className={navLink + " !py-1"} activeProps={{ className: activeNavLink + " !py-1" }}>
          Browse
        </Link>
        {user && (
          <Link to="/saved" className={navLink + " !py-1"} activeProps={{ className: activeNavLink + " !py-1" }}>
            Saved
          </Link>
        )}
        {profile?.role === "admin" && (
          <Link to="/admin" className={navLink + " !py-1"} activeProps={{ className: activeNavLink + " !py-1" }}>
            Admin
          </Link>
        )}
      </div>
    </header>
  );
}
