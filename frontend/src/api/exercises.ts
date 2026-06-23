import { apiFetch } from "./client";
import type { LibraryExercise } from "../types";

interface LibraryExerciseDTO {
  id: number;
  name: string;
  category: string | null;
}

/** Searches the read-only seeded exercise library (GET /exercises?search=). */
export async function searchExercises(query: string, signal?: AbortSignal): Promise<LibraryExercise[]> {
  const q = query.trim();
  const path = q ? `/exercises?search=${encodeURIComponent(q)}` : "/exercises";
  const dtos = await apiFetch<LibraryExerciseDTO[]>(path, { signal });
  return dtos.map((d) => ({ id: d.id, name: d.name, category: d.category }));
}
