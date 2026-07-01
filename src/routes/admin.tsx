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
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Moderate opportunities across all organizations.
        </p>

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
