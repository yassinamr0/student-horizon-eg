import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type OpportunityType = "internship" | "volunteering";
export type LocationValue = "cairo" | "giza" | "alexandria" | "other";
export type WorkStyle = "on_site" | "hybrid" | "remote";
export type Compensation = "paid" | "unpaid" | "participant_pays";

export interface OrganizationRow {
  id: string;
  name: string;
  website: string | null;
  contact_email: string | null;
  logo_url: string | null;
}

export interface OpportunityRow {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  requirements: string | null;
  opportunity_type: OpportunityType;
  location: LocationValue;
  work_style: WorkStyle;
  compensation: Compensation;
  minimum_age: number;
  application_deadline: string | null;
  application_url: string;
  is_verified: boolean;
  organizations: OrganizationRow | null;
}

export const LOCATION_LABELS: Record<LocationValue, string> = {
  cairo: "Cairo",
  giza: "Giza",
  alexandria: "Alexandria",
  other: "Other / Remote",
};

export const WORK_STYLE_LABELS: Record<WorkStyle, string> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const COMPENSATION_LABELS: Record<Compensation, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  participant_pays: "Participant pays",
};

export const TYPE_LABELS: Record<OpportunityType, string> = {
  internship: "Internship",
  volunteering: "Volunteering",
};

export const opportunitiesQuery = () =>
  queryOptions({
    queryKey: ["opportunities", "approved"],
    queryFn: async (): Promise<OpportunityRow[]> => {
      const { data, error } = await supabase
        .from("opportunities")
        .select(
          "id, organization_id, title, description, requirements, opportunity_type, location, work_style, compensation, minimum_age, application_deadline, application_url, is_verified, organizations(id, name, website, contact_email, logo_url)",
        )
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OpportunityRow[];
    },
  });

export const opportunityQuery = (id: string) =>
  queryOptions({
    queryKey: ["opportunity", id],
    queryFn: async (): Promise<OpportunityRow | null> => {
      const { data, error } = await supabase
        .from("opportunities")
        .select(
          "id, organization_id, title, description, requirements, opportunity_type, location, work_style, compensation, minimum_age, application_deadline, application_url, is_verified, organizations(id, name, website, contact_email, logo_url)",
        )
        .eq("id", id)
        .eq("approval_status", "approved")
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as OpportunityRow | null;
    },
  });
