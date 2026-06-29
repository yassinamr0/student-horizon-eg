import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SaveButton } from "@/components/SaveButton";
import {
  COMPENSATION_LABELS,
  LOCATION_LABELS,
  TYPE_LABELS,
  WORK_STYLE_LABELS,
  opportunityQuery,
} from "@/lib/opportunities";

function ErrorView({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-xl font-semibold">We couldn't load this opportunity</h1>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-xl font-semibold">Opportunity not found</h1>
      <Link to="/browse" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
        Back to browse
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({
    meta: [{ title: "Opportunity — Student Opportunities Egypt" }],
  }),
  errorComponent: ErrorView,
  notFoundComponent: NotFoundView,
  component: OpportunityDetails,
});

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "primary" }) {
  const cls =
    tone === "primary"
      ? "bg-accent text-accent-foreground"
      : "bg-secondary text-secondary-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

function OpportunityDetails() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(opportunityQuery(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (!data) return <NotFoundView />;

  const org = data.organizations;
  const deadline = data.application_deadline
    ? new Date(data.application_deadline).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Rolling — apply anytime";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </Link>

        <article className="mt-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-lg font-semibold text-accent-foreground">
                {org?.logo_url ? (
                  <img src={org.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  (org?.name ?? "?").charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-muted-foreground">
                    {org?.name}
                  </span>
                  {data.is_verified && (
                    <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified" />
                  )}
                </div>
                {org?.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {data.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Pill tone="primary">{TYPE_LABELS[data.opportunity_type]}</Pill>
            <Pill>{COMPENSATION_LABELS[data.compensation]}</Pill>
            <Pill>{WORK_STYLE_LABELS[data.work_style]}</Pill>
            <Pill>Age {data.minimum_age}+</Pill>
          </div>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{LOCATION_LABELS[data.location]}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Deadline: {deadline}</span>
            </div>
          </dl>

          <Section title="About this opportunity">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
              {data.description}
            </p>
          </Section>

          {data.requirements && (
            <Section title="Requirements">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
                {data.requirements}
              </p>
            </Section>
          )}

          <div className="mt-8 rounded-2xl bg-surface p-5">
            <p className="text-sm text-muted-foreground">
              Applications are handled by {org?.name ?? "the organization"}. We don't collect anything here.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={data.application_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Apply on {org?.name ?? "organization"}'s site
                <ExternalLink className="h-4 w-4" />
              </a>
              <SaveButton opportunityId={data.id} variant="full" className="h-12" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
