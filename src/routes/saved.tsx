import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useAuth } from "@/lib/auth";
import { savedOpportunitiesQuery } from "@/lib/saved";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [{ title: "My Saved Opportunities — Interhub" }],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { user, loading } = useAuth();
  const { data, isLoading } = useQuery(savedOpportunitiesQuery(user?.id));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">My Saved Opportunities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you've bookmarked, in one place.
        </p>

        <div className="mt-6">
          {loading ? null : !user ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <h2 className="text-lg font-semibold">Sign in to view your saved opportunities</h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Create a free account to bookmark opportunities and come back to them later.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Link
                  to="/sign-in"
                  className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  Sign up
                </Link>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <h2 className="text-lg font-semibold">Nothing saved yet</h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Tap the bookmark icon on any opportunity to save it here.
              </p>
              <Link
                to="/browse"
                className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Browse opportunities
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.map((o) => (
                <OpportunityCard key={o.id} opp={o} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
