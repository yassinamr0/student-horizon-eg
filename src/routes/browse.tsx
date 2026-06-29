import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { OpportunityCard } from "@/components/OpportunityCard";
import {
  COMPENSATION_LABELS,
  LOCATION_LABELS,
  TYPE_LABELS,
  WORK_STYLE_LABELS,
  opportunitiesQuery,
  type Compensation,
  type LocationValue,
  type OpportunityType,
  type WorkStyle,
} from "@/lib/opportunities";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/browse")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Browse Opportunities — Student Opportunities Egypt" },
      {
        name: "description",
        content:
          "Filter internships and volunteering opportunities for Egyptian high school students by type, location, work style, and compensation.",
      },
    ],
  }),
  component: Browse,
});

const TYPES: OpportunityType[] = ["internship", "volunteering"];
const LOCATIONS: LocationValue[] = ["cairo", "giza", "alexandria", "other"];
const WORK_STYLES: WorkStyle[] = ["on_site", "hybrid", "remote"];
const COMPENSATIONS: Compensation[] = ["paid", "unpaid", "participant_pays"];

interface Filters {
  types: OpportunityType[];
  locations: LocationValue[];
  workStyles: WorkStyle[];
  compensations: Compensation[];
  age: number | null;
}

const emptyFilters: Filters = {
  types: [],
  locations: [],
  workStyles: [],
  compensations: [],
  age: null,
};

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function useDebounced<T>(value: T, ms = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function Browse() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ);
  const debouncedQ = useDebounced(q, 200);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading } = useQuery(opportunitiesQuery());

  const filtered = useMemo(() => {
    const list = data ?? [];
    const needle = debouncedQ.trim().toLowerCase();
    return list.filter((o) => {
      if (filters.types.length && !filters.types.includes(o.opportunity_type)) return false;
      if (filters.locations.length && !filters.locations.includes(o.location)) return false;
      if (filters.workStyles.length && !filters.workStyles.includes(o.work_style)) return false;
      if (filters.compensations.length && !filters.compensations.includes(o.compensation)) return false;
      if (filters.age !== null && o.minimum_age > filters.age) return false;
      if (needle) {
        const hay = `${o.title} ${o.description} ${o.organizations?.name ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [data, filters, debouncedQ]);

  const activeFilterCount =
    filters.types.length +
    filters.locations.length +
    filters.workStyles.length +
    filters.compensations.length +
    (filters.age !== null ? 1 : 0);

  const clearAll = () => {
    setFilters(emptyFilters);
    setQ("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight">Browse Opportunities</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${filtered.length} opportunit${filtered.length === 1 ? "y" : "ies"}`}
            </p>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center rounded-full border border-border bg-card pl-4 pr-1.5 shadow-sm focus-within:border-primary/50">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, organization, or keyword…"
            className="h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden md:block">
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              activeFilterCount={activeFilterCount}
              onClear={clearAll}
            />
          </aside>

          <section>
            {isLoading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((o) => (
                  <OpportunityCard key={o.id} opp={o} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background p-5">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              activeFilterCount={activeFilterCount}
              onClear={clearAll}
            />
            <button
              onClick={() => setSheetOpen(false)}
              className="mt-4 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              Show {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FiltersPanel({
  filters,
  setFilters,
  activeFilterCount,
  onClear,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  activeFilterCount: number;
  onClear: () => void;
}) {
  return (
    <div className="space-y-6">
      {activeFilterCount > 0 && (
        <button onClick={onClear} className="text-xs font-medium text-primary hover:underline">
          Clear all filters
        </button>
      )}

      <FilterGroup title="Opportunity Type">
        {TYPES.map((t) => (
          <Chip
            key={t}
            active={filters.types.includes(t)}
            onClick={() => setFilters((f) => ({ ...f, types: toggle(f.types, t) }))}
          >
            {TYPE_LABELS[t]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="Location">
        {LOCATIONS.map((l) => (
          <Chip
            key={l}
            active={filters.locations.includes(l)}
            onClick={() => setFilters((f) => ({ ...f, locations: toggle(f.locations, l) }))}
          >
            {LOCATION_LABELS[l]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="Work Style">
        {WORK_STYLES.map((w) => (
          <Chip
            key={w}
            active={filters.workStyles.includes(w)}
            onClick={() => setFilters((f) => ({ ...f, workStyles: toggle(f.workStyles, w) }))}
          >
            {WORK_STYLE_LABELS[w]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="Compensation">
        {COMPENSATIONS.map((c) => (
          <Chip
            key={c}
            active={filters.compensations.includes(c)}
            onClick={() => setFilters((f) => ({ ...f, compensations: toggle(f.compensations, c) }))}
          >
            {COMPENSATION_LABELS[c]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="I am this age">
        <div className="flex flex-wrap gap-1.5">
          {[14, 15, 16, 17, 18].map((age) => (
            <Chip
              key={age}
              active={filters.age === age}
              onClick={() =>
                setFilters((f) => ({ ...f, age: f.age === age ? null : age }))
              }
            >
              {age}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <h3 className="text-lg font-semibold">No opportunities match your filters</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Try removing a filter or broadening your search.
      </p>
      <button
        onClick={onClear}
        className="mt-4 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
      >
        Clear filters
      </button>
    </div>
  );
}
