import { useCallback, useEffect, useState } from "react";
import { isAbortError } from "../api/client";
import { listWorkouts, createWorkout, updateWorkout, deleteWorkout } from "../api/workouts";
import type { WorkoutSession } from "../types";

export interface UseWorkouts {
  workouts: WorkoutSession[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  /** Persist a new workout; prepends it to local state on success. */
  create: (session: WorkoutSession) => Promise<WorkoutSession>;
  /** Persist edits to an existing workout; replaces it in local state on success. */
  update: (id: number, session: WorkoutSession) => Promise<WorkoutSession>;
  /** Delete a workout; removes it from local state on success. */
  remove: (id: number) => Promise<void>;
}

/**
 * Owns the workout history list and its CRUD operations. The list is fetched
 * once on mount (cancellable via AbortController); mutations call the API and
 * then patch local state so the UI stays in sync without a refetch.
 */
export function useWorkouts(): UseWorkouts {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    listWorkouts(controller.signal)
      .then((data) => {
        setWorkouts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return; // unmounted / superseded — ignore
        setError(err instanceof Error ? err.message : "Failed to load workouts");
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const create = useCallback(async (session: WorkoutSession) => {
    const saved = await createWorkout(session);
    setWorkouts((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const update = useCallback(async (id: number, session: WorkoutSession) => {
    const saved = await updateWorkout(id, session);
    setWorkouts((prev) => prev.map((w) => (w.id === id ? saved : w)));
    return saved;
  }, []);

  const remove = useCallback(async (id: number) => {
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { workouts, isLoading, error, reload, create, update, remove };
}
