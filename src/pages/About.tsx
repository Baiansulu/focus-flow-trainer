import { SiteNav, SiteFooter } from "@/components/SiteChrome";
import { Brain, Database, Cpu, Lightbulb, AlertTriangle, Rocket, Code2 } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteNav />
      <main className="container py-12 max-w-4xl">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">About the Project</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance">
          A closed-loop attention trainer driven by adaptive AI.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground text-balance">
          NeuroFocus is a senior design project that combines real-time gameplay telemetry with an adaptive
          controller to personalize cognitive training for each player.
        </p>

        <Section icon={Brain} title="Project Overview">
          <p>
            The system measures attention through a fast-paced visual reaction task. As the player engages with
            the game, the AI continuously evaluates focus, reaction speed, accuracy, and error patterns to
            adjust task difficulty in real time — keeping the user inside their personal flow zone.
          </p>
          <p>
            The original prototype was implemented in Python using <strong>Pygame</strong> with an <strong>SQLite</strong>{" "}
            backend. This Lovable version reproduces the same concept on the web for accessible demonstration.
          </p>
        </Section>

        <Section icon={Code2} title="Technologies Used">
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 list-disc pl-5">
            <li>React + TypeScript + Vite</li>
            <li>Tailwind CSS design system</li>
            <li>Recharts for telemetry</li>
            <li>Supabase-style schema (mocked locally)</li>
            <li>Pygame (original prototype)</li>
            <li>SQLite (original prototype)</li>
            <li>Adaptive AI controller (rule-based)</li>
            <li>LocalStorage persistence</li>
          </ul>
        </Section>

        <Section icon={Cpu} title="Adaptive AI Logic">
          <p>
            The controller observes per-round outcomes and updates a difficulty parameter <code className="font-mono">d ∈ [1, 10]</code>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Hit & fast reaction</strong> (&lt; 55% of allotted window) → increase difficulty</li>
            <li><strong>Hit & slow reaction</strong> → hold difficulty steady</li>
            <li><strong>Miss / timeout</strong> → decrease difficulty by one level</li>
          </ul>
          <p>
            Difficulty governs target lifetime (<code className="font-mono">ttl = 1700 − 130·d ms</code>) and target size
            (<code className="font-mono">size = 88 − 5·d px</code>), creating a smooth pressure curve. Future iterations
            will replace the rule-based policy with an online-learning bandit.
          </p>
        </Section>

        <Section icon={Database} title="Database Design">
          <p>The Supabase-style <code className="font-mono">sessions</code> table mirrors the original SQLite schema:</p>
          <pre className="mt-3 rounded-2xl bg-primary/95 text-primary-foreground p-5 text-xs md:text-sm overflow-x-auto leading-relaxed">
{`create table sessions (
  id              uuid primary key default gen_random_uuid(),
  player_name     text not null,
  session_date    timestamptz not null default now(),
  score           int  not null,
  accuracy        numeric(5,2) not null,
  avg_reaction_ms int  not null,
  difficulty_level int not null,
  rounds          int  not null,
  mistakes        int  not null
);`}
          </pre>
          <p className="mt-3">
            A <code className="font-mono">progress_history</code> view aggregates per-player trends for the dashboard.
          </p>
        </Section>

        <Section icon={AlertTriangle} title="Challenges">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Fine-tuning adaptive AI behavior to avoid oscillation between levels</li>
            <li>Database synchronization between offline play and remote storage</li>
            <li>Reducing input latency for accurate reaction-time measurement</li>
            <li>Performance optimization across devices and browsers</li>
            <li>Designing UI usability that supports presentation and real use</li>
          </ul>
        </Section>

        <Section icon={Rocket} title="Future Improvements">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Reinforcement-learning-based difficulty controller</li>
            <li>Richer scoring system with combos and streak rewards</li>
            <li>Per-player progress visualization with cohort comparisons</li>
            <li>Broader usability testing and accessibility review</li>
            <li>Comprehensive user and developer documentation</li>
          </ul>
        </Section>

        <Section icon={Lightbulb} title="Team Progress">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Built first mini-game prototype with Pygame</li>
            <li>Implemented player performance tracking</li>
            <li>Created initial database schema for player progress</li>
            <li>Developed adaptive difficulty logic</li>
            <li>Improved UI usability and gameplay flow</li>
            <li>Tested gameplay extensively and resolved bugs</li>
          </ul>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
};

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <section className="mt-10 rounded-3xl bg-card border border-border p-7 shadow-soft">
    <div className="flex items-center gap-3 mb-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
    <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

export default About;
