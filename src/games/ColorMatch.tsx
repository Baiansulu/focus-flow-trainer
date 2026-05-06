import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { saveSession } from "@/lib/sessions";

const COLORS = [
  { name: "RED", className: "text-red-500", hsl: "0 85% 55%" },
  { name: "BLUE", className: "text-blue-500", hsl: "220 85% 55%" },
  { name: "GREEN", className: "text-emerald-500", hsl: "150 70% 42%" },
  { name: "YELLOW", className: "text-yellow-500", hsl: "45 95% 50%" },
  { name: "PURPLE", className: "text-purple-500", hsl: "275 70% 55%" },
];

const ROUND_DURATION = 45_000;

type Trial = { word: string; color: typeof COLORS[number]; bornAt: number };

const ColorMatch = () => {
  const { user, displayName } = useAuth();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactions, setReactions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const startRef = useRef(0);

  const accuracy = hits + misses === 0 ? 100 : Math.round((hits / (hits + misses)) * 100);
  const avgReaction = reactions.length === 0 ? 0 : Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length);

  const nextTrial = () => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)].name;
    // Color is usually different from word to create Stroop interference
    let color = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (Math.random() > 0.25) {
      while (color.name === word) color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    setTrial({ word, color, bornAt: performance.now() });
  };

  useEffect(() => {
    if (!running) return;
    if (!trial) nextTrial();
    startRef.current = performance.now() - (ROUND_DURATION - timeLeft);
    const t = setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      const left = Math.max(0, ROUND_DURATION - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        setRunning(false);
        setDone(true);
        setTrial(null);
      }
    }, 100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (!done || hits + misses === 0 || !user) return;
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
      .then(() => toast.success("Color Match saved", { description: `Score ${score} · Accuracy ${accuracy}%` }))
      .catch(() => toast.error("Couldn't save session"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const choose = (name: string) => {
    if (!trial) return;
    const reaction = performance.now() - trial.bornAt;
    setReactions((r) => [...r, reaction]);
    if (name === trial.color.name) {
      setHits((h) => h + 1);
      const speed = Math.max(0, 60 - Math.floor(reaction / 25));
      setScore((s) => s + 12 + difficulty * 2 + speed);
      setDifficulty((d) => (reaction < 900 && d < 10 ? d + 1 : d));
    } else {
      setMisses((m) => m + 1);
      setScore((s) => Math.max(0, s - 6));
      setDifficulty((d) => (d > 1 ? d - 1 : 1));
    }
    nextTrial();
  };

  const start = () => { setDone(false); setRunning(true); };
  const reset = () => {
    setRunning(false); setDone(false); setTrial(null);
    setHits(0); setMisses(0); setReactions([]); setScore(0);
    setDifficulty(3); setTimeLeft(ROUND_DURATION);
  };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Stroop Challenge</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold">Tap the ink color, not the word.</h2>
        </div>
        <div className="flex items-center gap-2">
          {!running ? (
            <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-soft">
              <Play className="h-4 w-4" /> {done ? "Play again" : "Start"}
            </button>
          ) : null}
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <Stat label="Score" value={score.toString()} />
        <Stat label="Accuracy" value={`${accuracy}%`} accent="success" />
        <Stat label="Reaction" value={avgReaction ? `${avgReaction}ms` : "—"} accent="accent" />
        <Stat label="Mistakes" value={misses.toString()} accent="warning" />
        <Stat label="Difficulty" value={`Lv ${difficulty}`} accent="primary" />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Round time</span><span>{(timeLeft / 1000).toFixed(1)}s</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gradient-accent rounded-full transition-[width] duration-100 linear" style={{ width: `${(timeLeft / ROUND_DURATION) * 100}%` }} />
        </div>
      </div>

      <div className="relative w-full min-h-[420px] md:min-h-[520px] rounded-3xl bg-gradient-card border border-border shadow-card overflow-hidden p-8 flex flex-col items-center justify-center gap-10">
        {!running && !done && (
          <div className="text-center max-w-md">
            <h3 className="text-2xl font-semibold">Stroop Test</h3>
            <p className="mt-2 text-sm text-muted-foreground">A color word appears in a different color. Pick the <strong>color it's drawn in</strong>, not the word itself. Trains selective attention and inhibitory control.</p>
          </div>
        )}

        {done && (
          <div className="text-center animate-float-in">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Session complete</div>
            <h3 className="mt-2 text-3xl font-semibold">Nice focus.</h3>
            <p className="mt-2 text-sm text-muted-foreground">Score {score} · Accuracy {accuracy}% · {avgReaction}ms avg</p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button onClick={reset} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-secondary">Play again</button>
              <Link to="/dashboard" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">View dashboard</Link>
            </div>
          </div>
        )}

        {running && trial && (
          <>
            <div className={`text-7xl md:text-8xl font-extrabold tracking-tight animate-float-in ${trial.color.className}`}>
              {trial.word}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => choose(c.name)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold border border-border bg-card hover:bg-secondary ${c.className}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
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

export default ColorMatch;
