import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeProvider";

const signUpSchema = z.object({
  displayName: z.string().trim().min(1, "Name required").max(60),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});
const signInSchema = signUpSchema.pick({ email: true, password: true });

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Welcome aboard!");
        navigate("/dashboard");
      } else {
        const parsed = signInSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Signed in");
        navigate("/dashboard");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-soft grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <Link to="/" className="flex items-center gap-2.5 relative">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-background/15 backdrop-blur">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">NeuroFocus</div>
            <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">Adaptive AI</div>
          </div>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight max-w-sm">
            Train your attention with AI that adapts to <em className="text-accent-soft">you</em>.
          </h2>
          <p className="mt-4 text-sm opacity-80 max-w-sm">
            Sign in to save sessions, track progression, and watch the controller adjust difficulty in real time.
          </p>
        </div>
        <div className="text-xs opacity-60 relative">© {new Date().getFullYear()} NeuroFocus</div>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-end p-6">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-semibold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to continue training." : "Start tracking your attention progress."}
            </p>

            <button
              onClick={handleGoogle}
              disabled={busy}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-secondary disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              or
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <Field icon={UserIcon} placeholder="Display name" value={form.displayName} onChange={(v) => setForm({ ...form, displayName: v })} />
              )}
              <Field icon={Mail} type="email" placeholder="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field icon={Lock} type="password" placeholder="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-medium text-foreground hover:underline">
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, type = "text", placeholder, value, onChange }: { icon: any; type?: string; placeholder: string; value: string; onChange: (v: string) => void }) => (
  <div className="relative">
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

export default Auth;
