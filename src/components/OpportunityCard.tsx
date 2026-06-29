import { Link } from "@tanstack/react-router";
import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import {
  COMPENSATION_LABELS,
  LOCATION_LABELS,
  TYPE_LABELS,
  WORK_STYLE_LABELS,
  type OpportunityRow,
} from "@/lib/opportunities";

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "primary" | "muted" }) {
  const tones = {
    neutral: "bg-secondary text-secondary-foreground",
    primary: "bg-accent text-accent-foreground",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function formatDeadline(d: string | null) {
  if (!d) return "Rolling";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function OpportunityCard({ opp }: { opp: OpportunityRow }) {
  const org = opp.organizations;
  return (
    <Link
      to="/opportunities/$id"
      params={{ id: opp.id }}
      className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent font-semibold text-accent-foreground">
          {org?.logo_url ? (
            <img src={org.logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            (org?.name ?? "?").charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="truncate">{org?.name}</span>
            {opp.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verified" />}
          </div>
          <h3 className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-primary">
            {opp.title}
          </h3>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill tone="primary">{TYPE_LABELS[opp.opportunity_type]}</Pill>
        <Pill>{COMPENSATION_LABELS[opp.compensation]}</Pill>
        <Pill>{WORK_STYLE_LABELS[opp.work_style]}</Pill>
        <Pill tone="muted">Age {opp.minimum_age}+</Pill>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {LOCATION_LABELS[opp.location]}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          Apply by {formatDeadline(opp.application_deadline)}
        </span>
      </div>
    </Link>
  );
}
