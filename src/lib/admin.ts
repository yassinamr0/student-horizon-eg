import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface AdminOpportunityRow {
  id: string;
  title: string;
  approval_status: ApprovalStatus;
  opportunity_type: string;
  location: string;
  created_at: string;
  organization_id: string;
  organizations: { id: string; name: string } | null;
}

export const adminOpportunitiesQuery = () =>
  queryOptions({
    queryKey: ["admin", "opportunities"],
    queryFn: async (): Promise<AdminOpportunityRow[]> => {
      const { data, error } = await supabase
        .from("opportunities")
        .select(
          "id, title, approval_status, opportunity_type, location, created_at, organization_id, organizations(id, name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AdminOpportunityRow[];
    },
  });

export const adminOrganizationsQuery = () =>
  queryOptions({
    queryKey: ["admin", "organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

export async function setOpportunityStatus(id: string, status: ApprovalStatus) {
  const { error } = await supabase
    .from("opportunities")
    .update({ approval_status: status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteOpportunity(id: string) {
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw error;
}
