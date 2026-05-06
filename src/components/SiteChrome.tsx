import { Link, NavLink, useNavigate } from "react-router-dom";
import { Brain, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeProvider";

const links = [
  { to: "/", label: "Home" },
  { to: "/train", label: "Training" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

export const SiteNav = () => {
  const { user, displayName, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-soft transition-transform group-hover:scale-105">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">NeuroFocus</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Adaptive AI</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="font-medium">{displayName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-secondary"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <nav className="md:hidden flex items-center justify-center gap-1 pb-2 px-4 overflow-x-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export const SiteFooter = () => (
  <footer className="border-t border-border/50 mt-24">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <div>© {new Date().getFullYear()} NeuroFocus — Senior Design Project</div>
      <div className="flex gap-5">
        <Link to="/about" className="hover:text-foreground">About</Link>
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <Link to="/train" className="hover:text-foreground">Training</Link>
      </div>
    </div>
  </footer>
);
