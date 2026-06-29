import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, Sparkles, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Opportunities Egypt — Internships & Volunteering" },
      {
        name: "description",
        content:
          "A curated directory of internships and volunteering opportunities for Egyptian high school students.",
      },
      { property: "og:title", content: "Student Opportunities Egypt" },
      {
        property: "og:description",
        content:
          "Discover internships and volunteering opportunities built for Egyptian high school students.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: q.trim() ? { q: q.trim() } : {} });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-32 h-96 bg-[radial-gradient(ellipse_at_center,var(--color-accent),transparent_60%)] opacity-70"
          />
          <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:pt-24">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              For Egyptian high school students
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Discover internships and volunteering opportunities built for Egyptian high school students.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">
              A curated directory — every opportunity links you straight to the organization's own application page.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3">
              <Link
                to="/browse"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Browse Opportunities
              </Link>

              <form onSubmit={submit} className="mt-2 w-full max-w-md">
                <label htmlFor="home-search" className="sr-only">Search</label>
                <div className="flex items-center rounded-full border border-border bg-card pl-4 pr-1.5 shadow-sm focus-within:border-primary/50">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    id="home-search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search internships, organizations, topics…"
                    className="h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-full bg-foreground px-4 text-xs font-medium text-background hover:opacity-90"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Find Opportunities",
                body: "Internships and volunteering roles across Egypt, all vetted before they're listed.",
              },
              {
                icon: Filter,
                title: "Filter Easily",
                body: "Narrow down by type, location, work style, compensation, and your age.",
              },
              {
                icon: ExternalLink,
                title: "Apply Directly",
                body: "Every Apply button takes you straight to the organization's own form — nothing in between.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
