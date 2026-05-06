import { useCallback, useEffect, useRef, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteChrome";
import { saveSession } from "@/lib/sessions";
import { Pause, Play, RotateCcw, Target as TargetIcon } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Target = { id: number; x: number; y: number; size: number; bornAt: number; ttl: number };

const ROUND_DURATION = 45_000; // ms

const Train = () => {
  const { user, displayName } = useAuth();
  const arenaRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [difficulty, setDifficulty] = useState(3); // 1..10
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactions, setReactions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const idRef = useRef(0);
  const startRef = useRef(0);

  const accuracy = hits + misses === 0 ? 100 : Math.round((hits / (hits + misses)) * 100);
  const avgReaction = reactions.length === 0 ? 0 : Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length);

  const ttlForDifficulty = (d: number) => Math.max(550, 1700 - d * 130);
  const sizeForDifficulty = (d: number) => Math.max(36, 88 - d * 5);

  const spawn = useCallback(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const size = sizeForDifficulty(difficulty);
    const pad = size / 2 + 8;
    const x = pad + Math.random() * (rect.width - pad * 2);
    const y = pad + Math.random() * (rect.height - pad * 2);
    idRef.current += 1;
    setTarget({
      id: idRef.current,
      x,
      y,
      size,
      bornAt: performance.now(),
      ttl: ttlForDifficulty(difficulty),
    });
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - (ROUND_DURATION - timeLeft);
    const t = setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      const left = Math.max(0, ROUND_DURATION - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        setRunning(false);
        setDone(true);
        setTarget(null);
      }
    }, 100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Target lifecycle
  useEffect(() => {
    if (!running) return;
    if (!target) {
      const id = setTimeout(spawn, 350);
      return () => clearTimeout(id);
    }
    const expire = setTimeout(() => {
      setMisses((m) => m + 1);
      adapt(false);
      setTarget(null);
    }, target.ttl);
    return () => clearTimeout(expire);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, running, spawn]);

  // Save session when done
  useEffect(() => {
    if (!done) return;
    if (hits + misses === 0) return;
    if (!user) return;
    saveSession({
      user_id: user.id,
      player_name: displayName || "Player",
      session_date: new Date().toISOString(),
      score,
      accuracy,
      avg_reaction_ms: avgReaction || 0,
      difficulty_level: difficulty,
      rounds: hits + misses,
      mistakes: misses,
    })
      .then(() => toast.success("Session saved", { description: `Score ${score} · Accuracy ${accuracy}% · Lv ${difficulty}` }))
      .catch(() => toast.error("Couldn't save session"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const adapt = (hit: boolean, reactionMs?: number) => {
    setDifficulty((d) => {
      if (hit) {
        const fast = (reactionMs ?? 9999) < ttlForDifficulty(d) * 0.55;
        if (fast && d < 10) return d + 1;
        return d;
      }
      return d > 1 ? d - 1 : 1;
    });
  };

  const onHit = () => {
    if (!target) return;
    const reaction = performance.now() - target.bornAt;
    setReactions((r) => [...r, reaction]);
    setHits((h) => h + 1);
    const speedBonus = Math.max(0, 50 - Math.floor(reaction / 20));
    setScore((s) => s + 10 + difficulty * 2 + speedBonus);
    adapt(true, reaction);
    setTarget(null);
  };

  const onArenaMiss = () => {
    if (!running || !target) return;
    setMisses((m) => m + 1);
    setScore((s) => Math.max(0, s - 5));
    adapt(false);
  };

  const start = () => {
    setDone(false);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setDone(false);
    setTarget(null);
    setScore(0);
    setHits(0);
    setMisses(0);
    setReactions([]);
    setDifficulty(3);
    setTimeLeft(ROUND_DURATION);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteNav />
      <main className="container py-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Training Arena</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold">Focus. Click. Adapt.</h1>
          </div>
          <div className="flex items-center gap-2">
            {!running ? (
              <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-soft">
                <Play className="h-4 w-4" /> {done || timeLeft < ROUND_DURATION ? "Resume" : "Start"}
              </button>
            ) : (
              <button onClick={pause} className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium hover:bg-secondary/70">
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          <Stat label="Score" value={score.toString()} />
          <Stat label="Accuracy" value={`${accuracy}%`} accent="success" />
          <Stat label="Reaction" value={avgReaction ? `${avgReaction}ms` : "—"} accent="accent" />
          <Stat label="Mistakes" value={misses.toString()} accent="warning" />
          <Stat label="Difficulty" value={`Lv ${difficulty}`} accent="primary" />
        </div>

        {/* Time bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Round time</span>
            <span>{(timeLeft / 1000).toFixed(1)}s</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-accent rounded-full transition-[width] duration-100 linear"
              style={{ width: `${(timeLeft / ROUND_DURATION) * 100}%` }}
            />
          </div>
        </div>

        {/* Arena */}
        <div
          ref={arenaRef}
          onMouseDown={onArenaMiss}
          className="relative w-full h-[420px] md:h-[520px] rounded-3xl bg-gradient-card border border-border shadow-card overflow-hidden select-none"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          {!running && !done && timeLeft === ROUND_DURATION && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center max-w-md px-6">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <TargetIcon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">Ready when you are</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click the targets as quickly and accurately as you can. The AI will tune the speed and size to match your performance.
                </p>
              </div>
            </div>
          )}

          {done && (
            <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
              <div className="text-center max-w-md px-6 animate-float-in">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Session complete</div>
                <h2 className="mt-2 text-3xl font-semibold">Nice work.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Score {score} · Accuracy {accuracy}% · Avg reaction {avgReaction}ms · Reached Lv {difficulty}
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <button onClick={reset} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary">Play again</button>
                  <Link to="/dashboard" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">View dashboard</Link>
                </div>
              </div>
            </div>
          )}

          {target && (
            <button
              key={target.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                onHit();
              }}
              className="absolute rounded-full bg-gradient-accent shadow-glow animate-target-pop animate-pulse-ring grid place-items-center text-accent-foreground"
              style={{
                left: target.x - target.size / 2,
                top: target.y - target.size / 2,
                width: target.size,
                height: target.size,
              }}
              aria-label="Target"
            >
              <TargetIcon className="h-1/3 w-1/3 opacity-90" />
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Tip: misses on the empty area cost points. Stay deliberate — the controller rewards consistency.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: "success" | "accent" | "primary" | "warning" }) => {
  const color =
    accent === "success" ? "text-success" :
    accent === "accent" ? "text-accent" :
    accent === "primary" ? "text-primary" :
    accent === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
};

export default Train;
