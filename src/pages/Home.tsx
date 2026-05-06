import { Link } from "react-router-dom";
import { ArrowRight, Brain, Activity, Database, Sparkles, LineChart, Cpu } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteChrome";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteNav />
      <main>
        {/* Hero */}
        <section className="container pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7 animate-float-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Senior Design Project · Adaptive AI
              </div>
              <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight text-balance">
                AI-Adaptive <span className="italic text-accent">Attention</span> Training Game
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
                An AI-powered attention training game that adapts difficulty in real time based on
                player performance — reaction speed, accuracy, and focus.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  to="/train"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-elegant hover:shadow-glow transition-all"
                >
                  Start Training
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Learn how it works
                </Link>
              </div>

              <dl className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
                {[
                  { k: "Real-time", v: "Adaptation" },
                  { k: "10 Levels", v: "Difficulty" },
                  { k: "Live", v: "Telemetry" },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="text-2xl font-semibold tracking-tight">{s.k}</dt>
                    <dd className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="md:col-span-5">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-accent opacity-20 blur-3xl rounded-full" />
                <div className="relative rounded-3xl bg-gradient-card border border-border shadow-elegant p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Session · Live</div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                      </span>
                      Adapting
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: "Score", v: "890", c: "text-foreground" },
                      { l: "Accuracy", v: "93%", c: "text-success" },
                      { l: "Reaction", v: "455ms", c: "text-accent" },
                      { l: "Difficulty", v: "Lv 7", c: "text-primary" },
                    ].map((m) => (
                      <div key={m.l} className="rounded-2xl bg-background/60 border border-border p-4">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.l}</div>
                        <div className={`mt-1 text-2xl font-semibold ${m.c}`}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl bg-primary/5 border border-primary/10 p-4">
                    <div className="text-xs text-muted-foreground mb-2">Adaptive controller</div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full w-[72%] bg-gradient-accent rounded-full" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Tightening reaction window…</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container pb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">How it works</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">A closed loop between you and the AI.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "Attention model", text: "Tracks reaction time, accuracy, and lapses to estimate focus state per round." },
              { icon: Cpu, title: "Adaptive difficulty", text: "A controller raises or eases pacing, target size, and lifetime to keep you in flow." },
              { icon: Database, title: "Progress storage", text: "Sessions persist with a Supabase-style schema for longitudinal performance review." },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition-shadow">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Home;
