import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import {
  COMPENSATION_LABELS,
  LOCATION_LABELS,
  TYPE_LABELS,
  WORK_STYLE_LABELS,
  type OpportunityRow,
} from "@/lib/opportunities";
import { SaveButton } from "./SaveButton";

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
      className="card-interactive group block p-5"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[color:var(--color-brand-light)] font-display font-semibold text-[color:var(--color-brand-hover)]">
          {org?.logo_url ? (
            <img src={org.logo_url} alt="" className="h-full w-full rounded-md object-cover" />
          ) : (
            (org?.name ?? "?").charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-sans text-[13px] text-muted-foreground">
            <span className="truncate">{org?.name}</span>
            {opp.is_verified && (
              <span className="badge badge-verified !py-[2px] !px-1.5">
                <BadgeCheck className="h-3 w-3" />
              </span>
            )}
          </div>
          <h3 className="mt-1 line-clamp-2 font-display text-[18px] font-semibold leading-6 text-foreground">
            {opp.title}
          </h3>
        </div>
        <SaveButton opportunityId={opp.id} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={typeBadge[opp.opportunity_type] ?? "badge badge-neutral"}>
          {TYPE_LABELS[opp.opportunity_type]}
        </span>
        <span className={compBadge[opp.compensation] ?? "badge badge-neutral"}>
          {COMPENSATION_LABELS[opp.compensation]}
        </span>
        <span className={workBadge[opp.work_style] ?? "badge badge-neutral"}>
          {WORK_STYLE_LABELS[opp.work_style]}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between font-sans text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {LOCATION_LABELS[opp.location]}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Apply by {formatDeadline(opp.application_deadline)}
        </span>
      </div>
    </Link>
  );
}
