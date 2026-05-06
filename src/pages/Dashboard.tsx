import { useMemo } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteChrome";
import { loadSessions, resetSessions } from "@/lib/sessions";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { Activity, Gauge, Target, Trophy, Timer, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const sessions = useMemo(() => loadSessions().slice().sort((a, b) => +new Date(a.session_date) - +new Date(b.session_date)), []);
  const totals = useMemo(() => {
    const totalScore = sessions.reduce((s, x) => s + x.score, 0);
    const avgRT = Math.round(sessions.reduce((s, x) => s + x.avg_reaction_ms, 0) / Math.max(1, sessions.length));
    const avgAcc = Math.round(sessions.reduce((s, x) => s + x.accuracy, 0) / Math.max(1, sessions.length));
    const lastDiff = sessions.at(-1)?.difficulty_level ?? 1;
    const rounds = sessions.reduce((s, x) => s + x.rounds, 0);
    return { totalScore, avgRT, avgAcc, lastDiff, rounds };
  }, [sessions]);

  const chartData = sessions.map((s, i) => ({
    name: `S${i + 1}`,
    score: s.score,
    accuracy: s.accuracy,
    rt: s.avg_reaction_ms,
    diff: s.difficulty_level,
  }));

  const handleReset = () => {
    resetSessions();
    toast.success("Sample data restored");
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteNav />
      <main className="container py-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Player Dashboard</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold">Performance summary</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Aggregated insights across your training sessions, modeled after the Supabase schema used by the project.
            </p>
          </div>
          <button onClick={handleReset} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">
            <RefreshCw className="h-4 w-4" /> Reset sample data
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Kpi icon={Trophy} label="Total score" value={totals.totalScore.toLocaleString()} />
          <Kpi icon={Target} label="Avg accuracy" value={`${totals.avgAcc}%`} tone="success" />
          <Kpi icon={Timer} label="Avg reaction" value={`${totals.avgRT}ms`} tone="accent" />
          <Kpi icon={Activity} label="Rounds played" value={totals.rounds.toString()} />
          <Kpi icon={Gauge} label="Current level" value={`Lv ${totals.lastDiff}`} tone="primary" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <ChartCard title="Score progression" subtitle="Across recent sessions" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Difficulty climb" subtitle="Adaptive controller output">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="diff" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Sessions table */}
        <div className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Session history</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Schema: <code className="font-mono">sessions(player_name, session_date, score, accuracy, avg_reaction_ms, difficulty_level, rounds, mistakes)</code></p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  {["Date", "Player", "Score", "Accuracy", "Reaction", "Level", "Rounds", "Mistakes"].map((h) => (
                    <th key={h} className="text-left font-medium px-6 py-3 text-xs uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.slice().reverse().map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-6 py-3.5">{new Date(s.session_date).toLocaleDateString()}</td>
                    <td className="px-6 py-3.5 font-medium">{s.player_name}</td>
                    <td className="px-6 py-3.5">{s.score}</td>
                    <td className="px-6 py-3.5 text-success">{s.accuracy}%</td>
                    <td className="px-6 py-3.5 text-accent">{s.avg_reaction_ms}ms</td>
                    <td className="px-6 py-3.5">Lv {s.difficulty_level}</td>
                    <td className="px-6 py-3.5">{s.rounds}</td>
                    <td className="px-6 py-3.5 text-warning">{s.mistakes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 rounded-3xl bg-gradient-card border border-border p-7 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Performance summary</div>
          <p className="mt-3 text-base md:text-lg leading-relaxed text-balance">
            You are averaging <span className="font-semibold text-foreground">{totals.avgAcc}% accuracy</span> with a{" "}
            <span className="font-semibold text-foreground">{totals.avgRT}ms</span> reaction time. The adaptive controller
            has progressed you to <span className="font-semibold text-foreground">Level {totals.lastDiff}</span>, indicating
            sustained attention and consistent target acquisition. Continue training to push reaction times below 450ms.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

const Kpi = ({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone?: "success" | "accent" | "primary" }) => {
  const color =
    tone === "success" ? "text-success" :
    tone === "accent" ? "text-accent" :
    tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={`mt-2 text-2xl md:text-3xl font-semibold ${color}`}>{value}</div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-3xl bg-card border border-border p-6 shadow-soft ${className}`}>
    <div className="mb-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default Dashboard;
