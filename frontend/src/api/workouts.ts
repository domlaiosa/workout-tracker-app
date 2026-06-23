import { apiFetch } from "./client";
import type { Exercise, SetEntry, WorkoutSession } from "../types";

/* ------------------------- API DTOs (server shape) ------------------------ */
interface SetDTO {
  id: number;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
  notes: string | null;
}

interface ExerciseDTO {
  id: number;
  exerciseId: number;
  name: string;
  orderIndex: number;
  restSeconds: number | null;
  tempo: string | null;
  notes: string | null;
  sets: SetDTO[];
}

interface WorkoutDTO {
  id: number;
  name: string;
  bodyParts: string[];
  startedAt: string | null;
  finishedAt: string | null;
  durationSeconds: number | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  exercises: ExerciseDTO[];
}

/* ------------------------------- mappers ---------------------------------- */
function toSession(dto: WorkoutDTO): WorkoutSession {
  const dateSource = dto.startedAt ?? dto.createdAt;
  return {
    id: dto.id,
    name: dto.name,
    bodyParts: dto.bodyParts ?? [],
    date: dateSource ? Date.parse(dateSource) : Date.now(),
    durationSec: dto.durationSeconds ?? undefined,
    persisted: true,
    exercises: dto.exercises.map(
      (e): Exercise => ({
        id: e.id,
        exerciseId: e.exerciseId,
        name: e.name,
        tempo: e.tempo ?? "",
        restSec: e.restSeconds ?? 0,
        notes: e.notes ?? "",
        sets: e.sets.map(
          (s): SetEntry => ({
            id: s.id,
            weight: s.weight ?? "",
            reps: s.reps ?? "",
            done: s.completed,
          }),
        ),
      }),
    ),
  };
}

/** Request body for POST/PUT. Drops fully-empty sets and normalizes "" → null. */
function toPayload(session: WorkoutSession) {
  const durationSec = session.durationSec ?? 0;
  return {
    name: session.name,
    bodyParts: session.bodyParts,
    startedAt: new Date(session.date).toISOString(),
    finishedAt: new Date(session.date + durationSec * 1000).toISOString(),
    durationSeconds: durationSec,
    exercises: session.exercises.map((e, i) => ({
      exerciseId: e.exerciseId,
      orderIndex: i,
      restSeconds: e.restSec,
      tempo: e.tempo || null,
      notes: e.notes || null,
      sets: e.sets
        .filter((s) => s.weight !== "" || s.reps !== "")
        .map((s, j) => ({
          setNumber: j + 1,
          reps: s.reps === "" ? null : Number(s.reps),
          weight: s.weight === "" ? null : Number(s.weight),
          completed: s.done,
        })),
    })),
  };
}

/* ------------------------------- requests --------------------------------- */
export async function listWorkouts(signal?: AbortSignal): Promise<WorkoutSession[]> {
  const dtos = await apiFetch<WorkoutDTO[]>("/workouts", { signal });
  return dtos.map(toSession);
}

export async function createWorkout(session: WorkoutSession, signal?: AbortSignal): Promise<WorkoutSession> {
  const dto = await apiFetch<WorkoutDTO>("/workouts", { method: "POST", body: toPayload(session), signal });
  return toSession(dto);
}

export async function updateWorkout(id: number, session: WorkoutSession, signal?: AbortSignal): Promise<WorkoutSession> {
  const dto = await apiFetch<WorkoutDTO>(`/workouts/${id}`, { method: "PUT", body: toPayload(session), signal });
  return toSession(dto);
}

export async function deleteWorkout(id: number, signal?: AbortSignal): Promise<void> {
  await apiFetch<void>(`/workouts/${id}`, { method: "DELETE", signal });
}
