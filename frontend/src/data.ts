import type { WorkoutSession } from "./types";

/* ------------------------------- constants -------------------------------- */
export const uid = () => Math.random().toString(36).slice(2, 9);
export const LETTERS = "ABCDEFGHIJ".split("");

/** Target options shown as chips on the setup screen (UI taxonomy, not data). */
export const BODY_PARTS = [
  "Back", "Chest", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Glutes", "Cardio",
];

/* -------------------------------- helpers --------------------------------- */
export function fmtClock(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function fmtDur(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function relDay(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const totalVolume = (w: WorkoutSession): number =>
  w.exercises.reduce(
    (a, e) => a + e.sets.reduce((s, x) => s + (Number(x.weight) * Number(x.reps) || 0), 0),
    0,
  );

export const totalSets = (w: WorkoutSession): number =>
  w.exercises.reduce((a, e) => a + e.sets.length, 0);

export function computeStreak(history: WorkoutSession[]): number {
  const days = new Set(
    history.map((w) => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  // allow today OR yesterday to start the streak
  if (!days.has(cur.getTime())) cur.setDate(cur.getDate() - 1);
  while (days.has(cur.getTime())) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}
