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
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Asymmetric hero — text left, illustration right */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:pt-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:items-center lg:gap-16">
            <div className="max-w-[600px]">
              <span className="badge badge-internship">For High Schoolers in Egypt</span>

              <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[48px] sm:leading-[52px]">
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
