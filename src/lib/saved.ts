import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { OpportunityRow } from "./opportunities";

export const savedIdsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["saved-ids", userId ?? "anon"],
    enabled: !!userId,
    queryFn: async (): Promise<Set<string>> => {
      if (!userId) return new Set();
      const { data, error } = await supabase
        .from("saved_opportunities")
        .select("opportunity_id")
        .eq("user_id", userId);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.opportunity_id));
    },
  });

export const savedOpportunitiesQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["saved-opportunities", userId ?? "anon"],
    enabled: !!userId,
    queryFn: async (): Promise<OpportunityRow[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("saved_opportunities")
        .select(
          "opportunity_id, opportunities(id, organization_id, title, description, requirements, opportunity_type, location, work_style, compensation, minimum_age, application_deadline, application_url, is_verified, organizations(id, name, website, logo_url))",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((r) => (r as unknown as { opportunities: OpportunityRow | null }).opportunities)
        .filter((o): o is OpportunityRow => !!o && o.id != null);
    },
  });

export async function toggleSave(userId: string, opportunityId: string, currentlySaved: boolean) {
  if (currentlySaved) {
    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("user_id", userId)
      .eq("opportunity_id", opportunityId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("saved_opportunities")
      .insert({ user_id: userId, opportunity_id: opportunityId });
    if (error) throw error;
  }
}
