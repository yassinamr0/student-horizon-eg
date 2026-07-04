import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { isSafeHttpUrl } from "@/lib/url";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Post a Listing — Interhub" },
      {
        name: "description",
        content:
          "Organizations: submit an internship or volunteering opportunity for review by the Interhub team.",
      },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-16">
          <h1 className="font-display text-2xl font-bold">Post a Listing</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please{" "}
            <Link to="/sign-in" className="text-[color:var(--color-brand)] underline">
              sign in
            </Link>{" "}
            or{" "}
            <Link to="/sign-up" className="text-[color:var(--color-brand)] underline">
              create an account
            </Link>{" "}
            to submit an opportunity.
          </p>
        </div>
      </div>
    );
  }

  return <SubmitForm userId={user.id} onDone={() => navigate({ to: "/" })} />;
}

function SubmitForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const orgsQ = useQuery({
    queryKey: ["my", "organizations", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("owner_id", userId)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [orgMode, setOrgMode] = useState<"existing" | "new">("new");
  const [orgId, setOrgId] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgWebsite, setNewOrgWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [opportunityType, setOpportunityType] = useState("internship");
  const [location, setLocation] = useState("cairo");
  const [workStyle, setWorkStyle] = useState("on_site");
  const [compensation, setCompensation] = useState("unpaid");
  const [minimumAge, setMinimumAge] = useState("14");
  const [deadline, setDeadline] = useState("");

  const submitMut = useMutation({
    mutationFn: async () => {
      let organization_id = orgId;
      if (orgMode === "new") {
        if (!newOrgName.trim()) throw new Error("Organization name is required");
        const { data, error } = await supabase
          .from("organizations")
          .insert({
            name: newOrgName.trim(),
            website: newOrgWebsite.trim() || null,
            contact_email: contactEmail.trim() || null,
            owner_id: userId,
          })
          .select("id")
          .single();
        if (error) throw error;
        organization_id = data.id;
      }
      if (!organization_id) throw new Error("Please pick an organization");
      if (!title.trim() || !description.trim() || !applicationUrl.trim())
        throw new Error("Title, description, and application URL are required");

      const { error } = await supabase.from("opportunities").insert({
        organization_id,
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || null,
        application_url: applicationUrl.trim(),
        opportunity_type: opportunityType,
        location,
        work_style: workStyle,
        compensation,
        minimum_age: Number(minimumAge) || 14,
        application_deadline: deadline || null,
        approval_status: "pending",
        is_verified: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Submitted! An admin will review it shortly.");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-[28px] font-bold tracking-tight sm:text-[32px]">
          Post a Listing
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Submit an internship or volunteering opportunity. The Interhub team reviews every listing
          before it appears publicly.
        </p>

        <div className="mt-8 grid gap-5">
          <div className="grid gap-2">
            <Label>Organization</Label>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setOrgMode("new")}
                className={`rounded-full px-3 py-1 ${orgMode === "new" ? "bg-secondary" : "text-muted-foreground"}`}
              >
                New organization
              </button>
              <button
                type="button"
                onClick={() => setOrgMode("existing")}
                disabled={(orgsQ.data ?? []).length === 0}
                className={`rounded-full px-3 py-1 ${orgMode === "existing" ? "bg-secondary" : "text-muted-foreground"} disabled:opacity-40`}
              >
                One of mine
              </button>
            </div>
            {orgMode === "existing" ? (
              <Select value={orgId} onValueChange={setOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick an organization" />
                </SelectTrigger>
                <SelectContent>
                  {(orgsQ.data ?? []).map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid gap-2">
                <Input
                  placeholder="Organization name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
                <Input
                  placeholder="Website (optional)"
                  value={newOrgWebsite}
                  onChange={(e) => setNewOrgWebsite(e.target.value)}
                />
                <Input
                  placeholder="Contact email (optional)"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Requirements (optional)</Label>
            <Textarea rows={2} value={requirements} onChange={(e) => setRequirements(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Application URL</Label>
            <Input
              placeholder="https://…"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={opportunityType} onValueChange={setOpportunityType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="volunteering">Volunteering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cairo">Cairo</SelectItem>
                  <SelectItem value="giza">Giza</SelectItem>
                  <SelectItem value="alexandria">Alexandria</SelectItem>
                  <SelectItem value="other">Other / Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Work style</Label>
              <Select value={workStyle} onValueChange={setWorkStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_site">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Compensation</Label>
              <Select value={compensation} onValueChange={setCompensation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="participant_pays">Participant pays</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Minimum age</Label>
              <Input
                type="number"
                min={10}
                max={25}
                value={minimumAge}
                onChange={(e) => setMinimumAge(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Application deadline (optional)</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={onDone}>Cancel</Button>
            <Button onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>
              {submitMut.isPending ? "Submitting…" : "Submit for review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
