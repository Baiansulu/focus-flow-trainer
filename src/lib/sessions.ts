// Lightweight in-memory + localStorage "database" simulation.
// Mirrors a Supabase schema for sessions.

export type Session = {
  id: string;
  player_name: string;
  session_date: string; // ISO
  score: number;
  accuracy: number; // 0..100
  avg_reaction_ms: number;
  difficulty_level: number; // 1..10
  rounds: number;
  mistakes: number;
};

const KEY = "neurofocus.sessions.v1";

const seed: Session[] = [
  { id: "s1", player_name: "Demo Player", session_date: daysAgo(9), score: 420, accuracy: 78, avg_reaction_ms: 612, difficulty_level: 3, rounds: 18, mistakes: 4 },
  { id: "s2", player_name: "Demo Player", session_date: daysAgo(7), score: 510, accuracy: 82, avg_reaction_ms: 580, difficulty_level: 4, rounds: 22, mistakes: 4 },
  { id: "s3", player_name: "Demo Player", session_date: daysAgo(5), score: 640, accuracy: 86, avg_reaction_ms: 540, difficulty_level: 5, rounds: 25, mistakes: 3 },
  { id: "s4", player_name: "Demo Player", session_date: daysAgo(3), score: 720, accuracy: 88, avg_reaction_ms: 502, difficulty_level: 6, rounds: 28, mistakes: 3 },
  { id: "s5", player_name: "Demo Player", session_date: daysAgo(2), score: 805, accuracy: 91, avg_reaction_ms: 478, difficulty_level: 7, rounds: 30, mistakes: 2 },
  { id: "s6", player_name: "Demo Player", session_date: daysAgo(1), score: 890, accuracy: 93, avg_reaction_ms: 455, difficulty_level: 7, rounds: 32, mistakes: 2 },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function loadSessions(): Session[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

export function saveSession(s: Session) {
  const all = loadSessions();
  all.push(s);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function resetSessions() {
  localStorage.setItem(KEY, JSON.stringify(seed));
}
