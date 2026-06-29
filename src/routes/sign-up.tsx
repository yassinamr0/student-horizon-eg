import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [{ title: "Sign Up — Interhub" }],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    navigate({ to: "/browse" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save opportunities and keep track of where you applied.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
          <Field label="Full name" type="text" value={fullName} onChange={setFullName} required autoFocus />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          <button
            disabled={busy}
            className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  autoFocus,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
