import { useEffect, useState } from "react";
import { isAbortError } from "../api/client";
import { searchExercises } from "../api/exercises";
import type { LibraryExercise } from "../types";

export interface UseExerciseSearch {
  results: LibraryExercise[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Debounced search over the read-only exercise library. Each query change
 * starts a fresh request and aborts the previous one, so out-of-order
 * responses can't clobber the latest results (race-condition safe).
 */
export function useExerciseSearch(query: string): UseExerciseSearch {
  const [results, setResults] = useState<LibraryExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      searchExercises(query, controller.signal)
        .then((data) => {
          setResults(data);
          setIsLoading(false);
        })
        .catch((err) => {
          if (isAbortError(err)) return;
          setError(err instanceof Error ? err.message : "Failed to load exercises");
          setIsLoading(false);
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, isLoading, error };
}
