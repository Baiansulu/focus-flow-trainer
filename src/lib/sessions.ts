import { supabase } from "@/integrations/supabase/client";

export type Session = {
  id: string;
  player_name: string;
  session_date: string;
  score: number;
  accuracy: number;
  avg_reaction_ms: number;
  difficulty_level: number;
  rounds: number;
  mistakes: number;
};

const seedTemplates = [
  { offset: 9, score: 420, accuracy: 78, avg_reaction_ms: 612, difficulty_level: 3, rounds: 18, mistakes: 4 },
  { offset: 7, score: 510, accuracy: 82, avg_reaction_ms: 580, difficulty_level: 4, rounds: 22, mistakes: 4 },
  { offset: 5, score: 640, accuracy: 86, avg_reaction_ms: 540, difficulty_level: 5, rounds: 25, mistakes: 3 },
  { offset: 3, score: 720, accuracy: 88, avg_reaction_ms: 502, difficulty_level: 6, rounds: 28, mistakes: 3 },
  { offset: 2, score: 805, accuracy: 91, avg_reaction_ms: 478, difficulty_level: 7, rounds: 30, mistakes: 2 },
  { offset: 1, score: 890, accuracy: 93, avg_reaction_ms: 455, difficulty_level: 7, rounds: 32, mistakes: 2 },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export async function loadSessions(userId: string, playerName: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from("training_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("session_date", { ascending: true });

  if (error || !data) return [];

  if (data.length === 0) {
    // Seed sample data for first-time users so the dashboard isn't empty
    const rows = seedTemplates.map((t) => ({
      user_id: userId,
      player_name: playerName,
      session_date: daysAgo(t.offset),
      score: t.score,
      accuracy: t.accuracy,
      avg_reaction_ms: t.avg_reaction_ms,
      difficulty_level: t.difficulty_level,
      rounds: t.rounds,
      mistakes: t.mistakes,
    }));
    const { data: seeded } = await supabase.from("training_sessions").insert(rows).select();
    return (seeded ?? []).map(toSession);
  }

  return data.map(toSession);
}

function toSession(r: any): Session {
  return {
    id: r.id,
    player_name: r.player_name,
    session_date: r.session_date,
    score: r.score,
    accuracy: Number(r.accuracy),
    avg_reaction_ms: r.avg_reaction_ms,
    difficulty_level: r.difficulty_level,
    rounds: r.rounds,
    mistakes: r.mistakes,
  };
}

export async function saveSession(s: Omit<Session, "id"> & { user_id: string }) {
  const { error } = await supabase.from("training_sessions").insert({
    user_id: s.user_id,
    player_name: s.player_name,
    session_date: s.session_date,
    score: s.score,
    accuracy: s.accuracy,
    avg_reaction_ms: s.avg_reaction_ms,
    difficulty_level: s.difficulty_level,
    rounds: s.rounds,
    mistakes: s.mistakes,
  });
  if (error) throw error;
}

export async function resetSessions(userId: string, playerName: string): Promise<Session[]> {
  await supabase.from("training_sessions").delete().eq("user_id", userId);
  return loadSessions(userId, playerName);
}
