import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, ExternalLink, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Interhub — Internships & Volunteering for High School Students in Egypt" },
      {
        name: "description",
        content:
          "A curated directory of internships and volunteering opportunities for high school students in Egypt.",
      },
      { property: "og:title", content: "Interhub" },
      {
        property: "og:description",
        content:
          "Discover internships and volunteering opportunities built for high school students in Egypt.",
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />

      <main>
        {/* Asymmetric hero — text left, illustration right */}
        <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-24 sm:pt-24">
          {/* Mobile-only topographic accent: bleeds off the top-right, behind text */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-8 z-0 h-[340px] w-[340px] opacity-70 sm:-right-16 sm:h-[420px] sm:w-[420px] lg:hidden"
          >
            <svg
              viewBox="0 0 400 400"
              className="h-full w-full text-[color:var(--color-border)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            >
              {Array.from({ length: 11 }).map((_, i) => {
                const r = 40 + i * 20;
                return (
                  <ellipse
                    key={i}
                    cx="260"
                    cy="150"
                    rx={r}
                    ry={r * 0.72}
                    opacity={0.55 - i * 0.035}
                  />
                );
              })}
              <circle
                cx="260"
                cy="150"
                r="12"
                fill="var(--color-brand)"
                stroke="none"
                opacity="0.85"
              />
              <circle cx="90" cy="70" r="4" fill="var(--color-cta)" stroke="none" />
            </svg>
          </div>

          {/* Mobile-only brand tick — bottom-left of hero, echoes the desktop composition */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-6 z-0 hidden sm:block lg:hidden"
          >
            <div className="h-[2px] w-14 bg-[color:var(--color-brand)] opacity-70" />
          </div>

          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:items-center lg:gap-16">
            <div className="max-w-[600px]">
              <span className="badge badge-internship">For High Schoolers in Egypt</span>

              <h1 className="mt-5 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[40px] sm:leading-[1.05] lg:text-[48px] lg:leading-[52px]">
                Real internships and volunteering, built for high school students in Egypt.
              </h1>

              <p className="mt-5 font-sans text-[16px] leading-[26px] text-muted-foreground">
                A curated directory. Every opportunity links you straight to the organization&rsquo;s own application &mdash; nothing is submitted through Interhub.
              </p>

              <form onSubmit={submit} className="mt-8 flex items-center gap-2 rounded-md border border-border bg-surface p-1.5 focus-within:border-[color:var(--color-border-focus)]">
                <div className="flex flex-1 items-center gap-2 pl-2">
                  <Search className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search internships, organizations, topics&hellip;"
                    className="h-10 flex-1 bg-transparent font-sans text-[15px] outline-none placeholder:text-[color:var(--color-text-muted)]"
                  />
                </div>
                <button type="submit" className="btn-primary h-10 px-4 text-[14px]">
                  Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-4 flex items-center gap-4">
                <Link to="/browse" className="btn-ghost">
                  Or browse everything <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Topographic SVG — low contrast, warm tone */}
            <div className="relative hidden lg:block" aria-hidden>
              <svg
                viewBox="0 0 500 460"
                className="h-auto w-full text-[color:var(--color-border)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
              >
                {Array.from({ length: 14 }).map((_, i) => {
                  const r = 60 + i * 22;
                  return (
                    <ellipse
                      key={i}
                      cx="320"
                      cy="230"
                      rx={r}
                      ry={r * 0.72}
                      opacity={0.7 - i * 0.035}
                    />
                  );
                })}
                <circle
                  cx="320"
                  cy="230"
                  r="18"
                  fill="var(--color-brand)"
                  stroke="none"
                  opacity="0.9"
                />
                <circle
                  cx="140"
                  cy="120"
                  r="6"
                  fill="var(--color-cta)"
                  stroke="none"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Find Opportunities",
                body: "Internships and volunteering roles across Egypt, vetted before they&rsquo;re listed.",
              },
              {
                icon: Filter,
                title: "Filter Easily",
                body: "Narrow down by type, location, work style, compensation, and your age.",
              },
              {
                icon: ExternalLink,
                title: "Apply Directly",
                body: "Every Apply button opens the organization&rsquo;s own form &mdash; nothing in between.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="card-surface p-6">
                <Icon className="h-5 w-5 text-[color:var(--color-brand)]" />
                <h3 className="mt-4 font-display text-[18px] font-semibold leading-6 text-foreground">
                  {title}
                </h3>
                <p
                  className="mt-2 font-sans text-[15px] leading-6 text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
