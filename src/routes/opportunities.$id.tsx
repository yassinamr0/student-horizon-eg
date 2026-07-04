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
import { safeHttpUrl } from "@/lib/url";

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

const typeBadge: Record<string, string> = {
  internship: "badge badge-internship",
  volunteering: "badge badge-volunteering",
};
const compBadge: Record<string, string> = {
  paid: "badge badge-paid",
  unpaid: "badge badge-unpaid",
  participant_pays: "badge badge-participant-pays",
};
const workBadge: Record<string, string> = {
  on_site: "badge badge-onsite",
  hybrid: "badge badge-hybrid",
  remote: "badge badge-remote",
};

function OpportunityDetails() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(opportunityQuery(id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="skeleton h-64" />
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
          className="inline-flex items-center gap-1 font-sans text-[13px] text-muted-foreground transition-all duration-[180ms] hover:text-[color:var(--color-brand)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </Link>

        <article className="card-surface mt-4 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[color:var(--color-brand-light)] font-display text-lg font-semibold text-[color:var(--color-brand-hover)]">
              {org?.logo_url ? (
                <img src={org.logo_url} alt="" className="h-full w-full rounded-md object-cover" />
              ) : (
                (org?.name ?? "?").charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-sans text-[13px] font-medium text-muted-foreground">
                  {org?.name}
                </span>
                {data.is_verified && (
                  <span className="badge badge-verified">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              {safeHttpUrl(org?.website) && (
                <a
                  href={safeHttpUrl(org?.website)!}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-0.5 inline-flex items-center gap-1 font-sans text-[13px] text-[color:var(--color-brand)] hover:underline"
                >
                  Visit website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <h1 className="mt-6 font-display text-[28px] font-bold leading-[32px] tracking-[-0.01em] text-foreground sm:text-[36px] sm:leading-[40px]">
            {data.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className={typeBadge[data.opportunity_type] ?? "badge badge-neutral"}>
              {TYPE_LABELS[data.opportunity_type]}
            </span>
            <span className={compBadge[data.compensation] ?? "badge badge-neutral"}>
              {COMPENSATION_LABELS[data.compensation]}
            </span>
            <span className={workBadge[data.work_style] ?? "badge badge-neutral"}>
              {WORK_STYLE_LABELS[data.work_style]}
            </span>
            <span className="badge badge-neutral">Age {data.minimum_age}+</span>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{LOCATION_LABELS[data.location]}</span>
            </div>
            <div className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Deadline: {deadline}</span>
            </div>
          </dl>

          <Section title="About this opportunity">
            <p className="whitespace-pre-line font-sans text-[15px] leading-6 text-foreground">
              {data.description}
            </p>
          </Section>

          {data.requirements && (
            <Section title="Requirements">
              <p className="whitespace-pre-line font-sans text-[15px] leading-6 text-foreground">
                {data.requirements}
              </p>
            </Section>
          )}

          <div className="mt-8 rounded-md border border-border bg-[color:var(--color-brand-light)]/40 p-5">
            <p className="font-sans text-[13px] text-muted-foreground">
              Applications are handled by {org?.name ?? "the organization"}. Nothing is collected here.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={data.application_url}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-primary"
              >
                Apply on {org?.name ?? "organization"}&rsquo;s site
                <ExternalLink className="h-4 w-4" />
              </a>
              <SaveButton opportunityId={data.id} variant="full" />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-label text-muted-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
