import { badRequest } from '../lib/httpError.js'

/* ----------------------------- normalized types --------------------------- */
export interface SetInput {
  setNumber: number
  reps: number | null
  weight: number | null
  completed: boolean
  notes: string | null
}

export interface ExerciseInput {
  exerciseId: number
  orderIndex: number
  restSeconds: number | null
  tempo: string | null
  notes: string | null
  sets: SetInput[]
}

export interface WorkoutInput {
  name: string
  bodyParts: string[]
  startedAt: Date | null
  finishedAt: Date | null
  durationSeconds: number | null
  notes: string | null
  exercises: ExerciseInput[]
}

/* -------------------------------- helpers --------------------------------- */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asInt(value: unknown, field: string, { min }: { min?: number } = {}): number {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  if (typeof n !== 'number' || !Number.isFinite(n) || !Number.isInteger(n)) {
    throw badRequest(`${field} must be an integer`)
  }
  if (min !== undefined && n < min) throw badRequest(`${field} must be >= ${min}`)
  return n
}

function asOptionalInt(value: unknown, field: string, opts: { min?: number } = {}): number | null {
  if (value === null || value === undefined || value === '') return null
  return asInt(value, field, opts)
}

function asOptionalNumber(value: unknown, field: string, opts: { min?: number } = {}): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'string' ? Number(value) : value
  if (typeof n !== 'number' || !Number.isFinite(n)) throw badRequest(`${field} must be a number`)
  if (opts.min !== undefined && n < opts.min) throw badRequest(`${field} must be >= ${opts.min}`)
  return n
}

function asOptionalString(value: unknown, field: string, maxLen: number): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') throw badRequest(`${field} must be a string`)
  const trimmed = value.trim()
  if (trimmed === '') return null
  if (trimmed.length > maxLen) throw badRequest(`${field} must be <= ${maxLen} characters`)
  return trimmed
}

function asDate(value: unknown, field: string): Date | null {
  if (value === null || value === undefined || value === '') return null
  // Accept epoch milliseconds or an ISO-8601 string.
  const d = typeof value === 'number' ? new Date(value) : typeof value === 'string' ? new Date(value) : null
  if (!d || Number.isNaN(d.getTime())) throw badRequest(`${field} must be a valid date`)
  return d
}

/* ------------------------------- validators ------------------------------- */
function parseSet(raw: unknown, index: number): SetInput {
  if (!isObject(raw)) throw badRequest(`sets[${index}] must be an object`)
  return {
    setNumber: raw.setNumber === undefined ? index + 1 : asInt(raw.setNumber, `sets[${index}].setNumber`, { min: 1 }),
    reps: asOptionalInt(raw.reps, `sets[${index}].reps`, { min: 0 }),
    weight: asOptionalNumber(raw.weight, `sets[${index}].weight`, { min: 0 }),
    completed: raw.completed === undefined ? false : Boolean(raw.completed),
    notes: asOptionalString(raw.notes, `sets[${index}].notes`, 1000),
  }
}

function parseExercise(raw: unknown, index: number): ExerciseInput {
  if (!isObject(raw)) throw badRequest(`exercises[${index}] must be an object`)
  if (raw.exerciseId === undefined || raw.exerciseId === null) {
    throw badRequest(`exercises[${index}].exerciseId is required`)
  }
  const setsRaw = raw.sets === undefined ? [] : raw.sets
  if (!Array.isArray(setsRaw)) throw badRequest(`exercises[${index}].sets must be an array`)
  return {
    exerciseId: asInt(raw.exerciseId, `exercises[${index}].exerciseId`, { min: 1 }),
    orderIndex: raw.orderIndex === undefined ? index : asInt(raw.orderIndex, `exercises[${index}].orderIndex`, { min: 0 }),
    restSeconds: asOptionalInt(raw.restSeconds, `exercises[${index}].restSeconds`, { min: 0 }),
    tempo: asOptionalString(raw.tempo, `exercises[${index}].tempo`, 20),
    notes: asOptionalString(raw.notes, `exercises[${index}].notes`, 1000),
    sets: setsRaw.map(parseSet),
  }
}

/**
 * Validates and normalizes a workout request body for POST/PUT.
 * Throws a 400 HttpError on the first violation. `user_id` is intentionally
 * not accepted from the client — it stays null until auth is added.
 */
export function parseWorkoutInput(body: unknown): WorkoutInput {
  if (!isObject(body)) throw badRequest('Request body must be a JSON object')

  if (typeof body.name !== 'string' || body.name.trim() === '') {
    throw badRequest('name is required')
  }
  const name = body.name.trim()
  if (name.length > 255) throw badRequest('name must be <= 255 characters')

  let bodyParts: string[] = []
  if (body.bodyParts !== undefined) {
    if (!Array.isArray(body.bodyParts) || body.bodyParts.some((p) => typeof p !== 'string')) {
      throw badRequest('bodyParts must be an array of strings')
    }
    bodyParts = (body.bodyParts as string[]).map((p) => p.trim()).filter(Boolean)
  }

  const exercisesRaw = body.exercises === undefined ? [] : body.exercises
  if (!Array.isArray(exercisesRaw)) throw badRequest('exercises must be an array')

  return {
    name,
    bodyParts,
    startedAt: asDate(body.startedAt, 'startedAt'),
    finishedAt: asDate(body.finishedAt, 'finishedAt'),
    durationSeconds: asOptionalInt(body.durationSeconds, 'durationSeconds', { min: 0 }),
    notes: asOptionalString(body.notes, 'notes', 2000),
    exercises: exercisesRaw.map(parseExercise),
  }
}

/** Parses and validates a positive integer route param (e.g. :id). */
export function parseId(raw: string | string[] | undefined, field = 'id'): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1) throw badRequest(`${field} must be a positive integer`)
  return n
}
