/** Base path for the API. Vite proxies /api → the backend dev server. */
const BASE = "/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Thin fetch wrapper: prefixes the base path, sends/parses JSON, and turns
 * non-2xx responses into an ApiError carrying the backend's `{ error }` message.
 * Aborts (from an AbortController) propagate as DOMException("AbortError").
 */
export async function apiFetch<T>(path: string, { method = "GET", body, signal }: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return payload as T;
}

/** True for the abort signal fired when a component unmounts mid-request. */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}
