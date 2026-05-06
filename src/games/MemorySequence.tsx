import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { saveSession } from "@/lib/sessions";

const PADS = [
  { id: 0, base: "bg-emerald-500/40", lit: "bg-emerald-400", ring: "ring-emerald-400" },
  { id: 1, base: "bg-rose-500/40", lit: "bg-rose-400", ring: "ring-rose-400" },
  { id: 2, base: "bg-sky-500/40", lit: "bg-sky-400", ring: "ring-sky-400" },
  { id: 3, base: "bg-amber-500/40", lit: "bg-amber-400", ring: "ring-amber-400" },
];

type Phase = "idle" | "showing" | "input" | "fail" | "done";

const MemorySequence = () => {
  const { user, displayName } = useAuth();
  const [phase, setPhase] = useState<Phase>("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactions, setReactions] = useState<number[]>([]);
  const [bestRound, setBestRound] = useState(0);
  const reactionStart = useRef(0);

  const round = sequence.length;
  const accuracy = hits + misses === 0 ? 100 : Math.round((hits / (hits + misses)) * 100);
  const avgReaction = reactions.length === 0 ? 0 : Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length);

  const playSequence = async (seq: number[]) => {
    setPhase("showing");
    setStep(0);
    const interval = Math.max(280, 700 - seq.length * 25);
    for (let i = 0; i < seq.length; i++) {
      await new Promise((r) => setTimeout(r, 250));
      setActive(seq[i]);
      await new Promise((r) => setTimeout(r, interval));
      setActive(null);
    }
    reactionStart.current = performance.now();
    setPhase("input");
  };

  const startNewRound = (prev: number[]) => {
    const next = [...prev, Math.floor(Math.random() * 4)];
    setSequence(next);
    setStep(0);
    playSequence(next);
  };

  const start = () => {
    setScore(0); setHits(0); setMisses(0); setReactions([]); setBestRound(0);
    setSequence([]);
    startNewRound([]);
  };

  const reset = () => {
    setPhase("idle"); setSequence([]); setStep(0); setActive(null);
    setScore(0); setHits(0); setMisses(0); setReactions([]); setBestRound(0);
  };

  const finish = (finalScore: number, finalHits: number, finalMisses: number, finalReactions: number[], best: number) => {
    setPhase("done");
    if (!user) return;
    const acc = finalHits + finalMisses === 0 ? 100 : Math.round((finalHits / (finalHits + finalMisses)) * 100);
    const avg = finalReactions.length === 0 ? 0 : Math.round(finalReactions.reduce((a, b) => a + b, 0) / finalReactions.length);
    saveSession({
      user_id: user.id,
      player_name: displayName || "Player",
      session_date: new Date().toISOString(),
      score: finalScore,
      accuracy: acc,
      avg_reaction_ms: avg,
      difficulty_level: Math.min(10, Math.max(1, best)),
      rounds: finalHits + finalMisses,
      mistakes: finalMisses,
    })
      .then(() => toast.success("Memory session saved", { description: `Reached round ${best} · Score ${finalScore}` }))
      .catch(() => toast.error("Couldn't save session"));
  };

  const tap = (id: number) => {
    if (phase !== "input") return;
    setActive(id);
    setTimeout(() => setActive(null), 150);
    const expected = sequence[step];
    const reaction = performance.now() - reactionStart.current;
    reactionStart.current = performance.now();
    if (id === expected) {
      const newReactions = [...reactions, reaction];
      const newHits = hits + 1;
      const newScore = score + 10 + sequence.length * 2;
      setReactions(newReactions);
      setHits(newHits);
      setScore(newScore);
      const nextStep = step + 1;
      if (nextStep === sequence.length) {
        const newBest = Math.max(bestRound, sequence.length);
        setBestRound(newBest);
        if (sequence.length >= 12) {
          finish(newScore, newHits, misses, newReactions, newBest);
          return;
        }
        setTimeout(() => startNewRound(sequence), 600);
      } else {
        setStep(nextStep);
      }
    } else {
      const newMisses = misses + 1;
      setMisses(newMisses);
      setPhase("fail");
      setTimeout(() => finish(score, hits, newMisses, reactions, bestRound), 600);
    }
  };

  // status text
  const statusText = phase === "showing" ? "Watch the pattern…" :
    phase === "input" ? `Repeat the sequence — ${step}/${sequence.length}` :
    phase === "fail" ? "Wrong tile!" :
    phase === "done" ? "Round complete." : "Press start to begin.";

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Memory Sequence</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold">Watch. Remember. Repeat.</h2>
        </div>
        <div className="flex items-center gap-2">
          {(phase === "idle" || phase === "done") && (
            <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-soft">
              <Play className="h-4 w-4" /> {phase === "done" ? "Play again" : "Start"}
            </button>
          )}
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
        <Stat label="Round" value={round ? `${round}` : "—"} accent="primary" />
      </div>

      <div className="relative w-full min-h-[420px] md:min-h-[520px] rounded-3xl bg-gradient-card border border-border shadow-card overflow-hidden p-8 flex flex-col items-center justify-center gap-8">
        <div className="text-sm text-muted-foreground">{statusText}</div>

        <div className="grid grid-cols-2 gap-4 w-[300px] md:w-[380px]">
          {PADS.map((p) => {
            const isActive = active === p.id;
            return (
              <button
                key={p.id}
                onClick={() => tap(p.id)}
                disabled={phase !== "input"}
                className={`aspect-square rounded-2xl transition-all duration-150 border border-border ${isActive ? `${p.lit} ring-4 ${p.ring} scale-[0.97]` : p.base} ${phase === "input" ? "hover:opacity-90 cursor-pointer" : "cursor-default"}`}
                aria-label={`Pad ${p.id + 1}`}
              />
            );
          })}
        </div>

        {phase === "done" && (
          <div className="text-center animate-float-in">
            <p className="text-sm text-muted-foreground">Best round: {bestRound} · Score {score}</p>
            <div className="mt-3">
              <Link to="/dashboard" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">View dashboard</Link>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">Trains working memory and sustained attention. Sequences grow with each round.</p>
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

export default MemorySequence;
