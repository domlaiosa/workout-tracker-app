/* ------------------------------ domain types ------------------------------ */
export type Units = "lb" | "kg";

export type Screen =
  | "home"
  | "history"
  | "setup"
  | "active"
  | "pickExercise"
  | "exercise"
  | "settings";

/** Local rows use a string uid; rows loaded from the backend use their numeric id. */
export type Id = number | string;

/** An empty string represents an unfilled numeric field. */
export type NumField = number | "";

export interface SetEntry {
  id: Id;
  weight: NumField;
  reps: NumField;
  done: boolean;
}

export interface Exercise {
  id: Id;
  /** FK into the seeded exercise_library (read-only catalog). */
  exerciseId: number;
  name: string;
  tempo: string;
  restSec: number;
  notes: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: Id;
  name: string;
  date: number;
  bodyParts: string[];
  durationSec?: number;
  exercises: Exercise[];
  /** True once the workout has been saved to the backend (has a numeric id). */
  persisted?: boolean;
}

export interface Draft {
  name: string;
  parts: string[];
}

/** A row from the read-only seeded exercise library. */
export interface LibraryExercise {
  id: number;
  name: string;
  category: string | null;
}
