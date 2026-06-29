import { Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    mut.mutate();
  };

  if (!user && variant === "full") {
    return (
      <Link
        to="/sign-in"
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium hover:border-primary/40 ${className}`}
      >
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
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition ${
          saved
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card hover:border-primary/40"
        } ${className}`}
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
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
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition ${
        saved
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
      } ${className}`}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </button>
  );
}
