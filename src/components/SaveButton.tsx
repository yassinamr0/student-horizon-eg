import { Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { savedIdsQuery, toggleSave } from "@/lib/saved";
import { Link, useNavigate } from "@tanstack/react-router";

interface Props {
  opportunityId: string;
  variant?: "icon" | "full";
  className?: string;
}

export function SaveButton({ opportunityId, variant = "icon", className = "" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: savedIds } = useQuery(savedIdsQuery(user?.id));
  const saved = savedIds?.has(opportunityId) ?? false;
  const [pulsing, setPulsing] = useState(false);

  const mut = useMutation({
    mutationFn: () => toggleSave(user!.id, opportunityId, saved),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-ids", user?.id] });
      qc.invalidateQueries({ queryKey: ["saved-opportunities", user?.id] });
      toast.success(saved ? "Removed from saved" : "Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Sign in to save", {
        description: "Create a free account to bookmark opportunities.",
        action: { label: "Sign in", onClick: () => navigate({ to: "/sign-in" }) },
      });
      return;
    }
    setPulsing(true);
    setTimeout(() => setPulsing(false), 220);
    mut.mutate();
  };

  if (!user && variant === "full") {
    return (
      <Link to="/sign-in" className={`btn-outline ${className}`}>
        <Bookmark className="h-4 w-4" /> Sign in to save
      </Link>
    );
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={mut.isPending}
        className={`btn-outline ${saved ? "!border-[color:var(--color-brand)] !text-[color:var(--color-brand)] !bg-[color:var(--color-brand-light)]" : ""} ${className}`}
      >
        <span className={pulsing ? "save-pulse inline-flex" : "inline-flex"}>
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </span>
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Remove from saved" : "Save opportunity"}
      disabled={mut.isPending}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border transition-all duration-[180ms] ease-out ${
        saved
          ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-light)] text-[color:var(--color-brand)]"
          : "border-border bg-surface text-muted-foreground hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
      } ${className}`}
    >
      <span className={pulsing ? "save-pulse inline-flex" : "inline-flex"}>
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      </span>
    </button>
  );
}
