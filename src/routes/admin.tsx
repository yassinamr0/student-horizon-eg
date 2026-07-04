import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  adminOpportunitiesQuery,
  adminOrganizationsQuery,
  deleteOpportunity,
  setOpportunityStatus,
  type ApprovalStatus,
} from "@/lib/admin";
import { isSafeHttpUrl } from "@/lib/url";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Interhub" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Wait for profile to load before deciding admin status
  const profilePending = !!user && !profile;

  useEffect(() => {
    if (loading || profilePending) return;
    if (!user) return; // show inline CTA below
    if (profile?.role !== "admin") {
      navigate({ to: "/" });
    }
  }, [loading, profilePending, user, profile, navigate]);

  if (loading || profilePending) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-xl font-semibold">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please <Link to="/sign-in" className="text-primary underline">sign in</Link> with an admin account.
          </p>
        </div>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return null;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const qc = useQueryClient();
  const oppsQ = useQuery(adminOpportunitiesQuery());
  const orgsQ = useQuery(adminOrganizationsQuery());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApprovalStatus>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  const rows = oppsQ.data ?? [];

  const counts = useMemo(() => {
    const c = { total: rows.length, pending: 0, approved: 0, rejected: 0 };
    for (const r of rows) {
      if (r.approval_status === "pending") c.pending++;
      else if (r.approval_status === "approved") c.approved++;
      else if (r.approval_status === "rejected") c.rejected++;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.approval_status !== statusFilter) return false;
      if (orgFilter !== "all" && r.organization_id !== orgFilter) return false;
      if (s) {
        const t = r.title.toLowerCase();
        const o = r.organizations?.name.toLowerCase() ?? "";
        if (!t.includes(s) && !o.includes(s)) return false;
      }
      return true;
    });
  }, [rows, search, statusFilter, orgFilter]);

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApprovalStatus }) =>
      setOpportunityStatus(id, status),
    onSuccess: (_d, vars) => {
      toast.success(`Marked ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "opportunities"] });
      qc.invalidateQueries({ queryKey: ["opportunities", "approved"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteOpportunity(id),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "opportunities"] });
      qc.invalidateQueries({ queryKey: ["opportunities", "approved"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Moderate opportunities across all organizations.
            </p>
          </div>
          <CreateOpportunityDialog organizations={orgsQ.data ?? []} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={counts.total} />
          <StatCard label="Pending" value={counts.pending} tone="pending" />
          <StatCard label="Approved" value={counts.approved} tone="approved" />
          <StatCard label="Rejected" value={counts.rejected} tone="rejected" />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search title or organization…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={orgFilter} onValueChange={setOrgFilter}>
            <SelectTrigger className="sm:w-56"><SelectValue placeholder="Organization" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {(orgsQ.data ?? []).map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oppsQ.isLoading ? (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">No opportunities match.</TableCell></TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-muted-foreground">{r.organizations?.name ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={r.approval_status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={r.approval_status === "approved" || statusMut.isPending}
                          onClick={() => statusMut.mutate({ id: r.id, status: "approved" })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={r.approval_status === "rejected" || statusMut.isPending}
                          onClick={() => statusMut.mutate({ id: r.id, status: "rejected" })}
                        >
                          Reject
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/opportunities/$id" params={{ id: r.id }}>Edit</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={deleteMut.isPending}
                          onClick={() => {
                            if (confirm(`Delete "${r.title}"? This cannot be undone.`)) {
                              deleteMut.mutate(r.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "pending" | "approved" | "rejected";
}) {
  const toneClass =
    tone === "approved"
      ? "text-primary"
      : tone === "pending"
        ? "text-amber-600"
        : tone === "rejected"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const variant =
    status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary";
  return <Badge variant={variant} className="capitalize">{status}</Badge>;
}

function CreateOpportunityDialog({
  organizations,
}: {
  organizations: { id: string; name: string }[];
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [orgMode, setOrgMode] = useState<"existing" | "new">(
    organizations.length > 0 ? "existing" : "new",
  );
  const [orgId, setOrgId] = useState<string>("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgWebsite, setNewOrgWebsite] = useState("");
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

  const reset = () => {
    setTitle(""); setDescription(""); setRequirements(""); setApplicationUrl("");
    setOpportunityType("internship"); setLocation("cairo"); setWorkStyle("on_site");
    setCompensation("unpaid"); setMinimumAge("14"); setDeadline("");
    setNewOrgName(""); setNewOrgWebsite(""); setOrgId("");
  };

  const createMut = useMutation({
    mutationFn: async () => {
      let organization_id = orgId;
      if (orgMode === "new") {
        if (!newOrgName.trim()) throw new Error("Organization name is required");
        const websiteVal = newOrgWebsite.trim() || null;
        if (websiteVal && !isSafeHttpUrl(websiteVal))
          throw new Error("Website must start with http:// or https://");
        const { data, error } = await supabase
          .from("organizations")
          .insert({ name: newOrgName.trim(), website: websiteVal })
          .select("id")
          .single();
        if (error) throw error;
        organization_id = data.id;
      }
      if (!organization_id) throw new Error("Please pick an organization");
      if (!title.trim() || !description.trim() || !applicationUrl.trim())
        throw new Error("Title, description, and application URL are required");
      if (!isSafeHttpUrl(applicationUrl.trim()))
        throw new Error("Application URL must start with http:// or https://");

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
        approval_status: "approved",
        is_verified: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Opportunity created");
      qc.invalidateQueries({ queryKey: ["admin", "opportunities"] });
      qc.invalidateQueries({ queryKey: ["admin", "organizations"] });
      qc.invalidateQueries({ queryKey: ["opportunities", "approved"] });
      reset();
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Opportunity</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Opportunity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Organization</Label>
            <div className="flex gap-2 text-sm">
              <button type="button" onClick={() => setOrgMode("existing")}
                className={`rounded-full px-3 py-1 ${orgMode === "existing" ? "bg-secondary" : "text-muted-foreground"}`}>
                Existing
              </button>
              <button type="button" onClick={() => setOrgMode("new")}
                className={`rounded-full px-3 py-1 ${orgMode === "new" ? "bg-secondary" : "text-muted-foreground"}`}>
                New
              </button>
            </div>
            {orgMode === "existing" ? (
              <Select value={orgId} onValueChange={setOrgId}>
                <SelectTrigger><SelectValue placeholder="Pick an organization" /></SelectTrigger>
                <SelectContent>
                  {organizations.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <Input placeholder="Organization name" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} />
                <Input placeholder="Website (optional)" value={newOrgWebsite} onChange={(e) => setNewOrgWebsite(e.target.value)} />
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
            <Input placeholder="https://…" value={applicationUrl} onChange={(e) => setApplicationUrl(e.target.value)} />
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
              <Input type="number" min={10} max={25} value={minimumAge} onChange={(e) => setMinimumAge(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Application deadline (optional)</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
            {createMut.isPending ? "Creating…" : "Create opportunity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
