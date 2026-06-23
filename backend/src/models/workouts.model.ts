import { eq, inArray, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { workouts, workoutExercises, sets, exerciseLibrary } from '../db/schema.js'
import { badRequest } from '../lib/httpError.js'
import type { WorkoutInput } from '../validation/workout.js'

/* ------------------------------- output DTOs ------------------------------ */
export interface SetDTO {
  id: number
  setNumber: number
  reps: number | null
  weight: number | null
  completed: boolean
  notes: string | null
}

export interface ExerciseDTO {
  id: number
  exerciseId: number
  name: string
  orderIndex: number
  restSeconds: number | null
  tempo: string | null
  notes: string | null
  sets: SetDTO[]
}

export interface WorkoutDTO {
  id: number
  userId: string | null
  name: string
  bodyParts: string[]
  startedAt: string | null
  finishedAt: string | null
  durationSeconds: number | null
  notes: string | null
  createdAt: string | null
  updatedAt: string | null
  exercises: ExerciseDTO[]
}

// The transaction handle passed to db.transaction(cb) — used by insertChildren.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

const iso = (d: Date | null) => (d ? d.toISOString() : null)
// postgres `numeric` comes back as a string; expose it as a number to the client.
const num = (v: string | null) => (v === null ? null : Number(v))

/* ------------------------------- assembly --------------------------------- */
/** Loads the exercises + sets for a set of workout ids and groups them by workout id. */
async function loadExercisesByWorkout(workoutIds: number[]): Promise<Map<number, ExerciseDTO[]>> {
  const byWorkout = new Map<number, ExerciseDTO[]>()
  if (workoutIds.length === 0) return byWorkout

  const exRows = await db
    .select({
      id: workoutExercises.id,
      workoutId: workoutExercises.workoutId,
      exerciseId: workoutExercises.exerciseId,
      name: exerciseLibrary.name,
      orderIndex: workoutExercises.orderIndex,
      restSeconds: workoutExercises.restSeconds,
      tempo: workoutExercises.tempo,
      notes: workoutExercises.notes,
    })
    .from(workoutExercises)
    .innerJoin(exerciseLibrary, eq(workoutExercises.exerciseId, exerciseLibrary.id))
    .where(inArray(workoutExercises.workoutId, workoutIds))
    .orderBy(workoutExercises.orderIndex)

  const exById = new Map<number, ExerciseDTO>()
  for (const r of exRows) {
    const dto: ExerciseDTO = {
      id: r.id,
      exerciseId: r.exerciseId,
      name: r.name,
      orderIndex: r.orderIndex,
      restSeconds: r.restSeconds,
      tempo: r.tempo,
      notes: r.notes,
      sets: [],
    }
    exById.set(r.id, dto)
    const list = byWorkout.get(r.workoutId) ?? []
    list.push(dto)
    byWorkout.set(r.workoutId, list)
  }

  const exerciseRowIds = [...exById.keys()]
  if (exerciseRowIds.length > 0) {
    const setRows = await db
      .select()
      .from(sets)
      .where(inArray(sets.workoutExerciseId, exerciseRowIds))
      .orderBy(sets.setNumber)
    for (const s of setRows) {
      exById.get(s.workoutExerciseId)?.sets.push({
        id: s.id,
        setNumber: s.setNumber,
        reps: s.reps,
        weight: num(s.weight),
        completed: s.completed,
        notes: s.notes,
      })
    }
  }

  return byWorkout
}

function toWorkoutDTO(row: typeof workouts.$inferSelect, exercises: ExerciseDTO[]): WorkoutDTO {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    bodyParts: row.bodyParts ?? [],
    startedAt: iso(row.startedAt),
    finishedAt: iso(row.finishedAt),
    durationSeconds: row.durationSeconds,
    notes: row.notes,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    exercises,
  }
}

/* -------------------------------- queries --------------------------------- */
export async function findAllWorkouts(): Promise<WorkoutDTO[]> {
  const rows = await db.select().from(workouts).orderBy(desc(workouts.startedAt), desc(workouts.id))
  const byWorkout = await loadExercisesByWorkout(rows.map((r) => r.id))
  return rows.map((r) => toWorkoutDTO(r, byWorkout.get(r.id) ?? []))
}

export async function findWorkoutById(id: number): Promise<WorkoutDTO | null> {
  const [row] = await db.select().from(workouts).where(eq(workouts.id, id))
  if (!row) return null
  const byWorkout = await loadExercisesByWorkout([id])
  return toWorkoutDTO(row, byWorkout.get(id) ?? [])
}

/** Throws a 400 if any referenced exercise id is missing from the library. */
async function assertExercisesExist(input: WorkoutInput): Promise<void> {
  const ids = [...new Set(input.exercises.map((e) => e.exerciseId))]
  if (ids.length === 0) return
  const found = await db
    .select({ id: exerciseLibrary.id })
    .from(exerciseLibrary)
    .where(inArray(exerciseLibrary.id, ids))
  const foundIds = new Set(found.map((f) => f.id))
  const missing = ids.filter((id) => !foundIds.has(id))
  if (missing.length > 0) {
    throw badRequest(`Unknown exercise id(s): ${missing.join(', ')}`)
  }
}

/** Inserts the workout's exercises and sets. Assumes it runs inside a transaction. */
async function insertChildren(tx: Tx, workoutId: number, input: WorkoutInput): Promise<void> {
  for (const [i, ex] of input.exercises.entries()) {
    const [we] = await tx
      .insert(workoutExercises)
      .values({
        workoutId,
        exerciseId: ex.exerciseId,
        orderIndex: ex.orderIndex ?? i,
        restSeconds: ex.restSeconds,
        tempo: ex.tempo,
        notes: ex.notes,
      })
      .returning({ id: workoutExercises.id })

    if (ex.sets.length > 0) {
      await tx.insert(sets).values(
        ex.sets.map((s, j) => ({
          workoutExerciseId: we.id,
          setNumber: s.setNumber ?? j + 1,
          reps: s.reps,
          weight: s.weight === null ? null : String(s.weight),
          completed: s.completed,
          notes: s.notes,
        })),
      )
    }
  }
}

export async function createWorkout(input: WorkoutInput): Promise<WorkoutDTO> {
  await assertExercisesExist(input)
  const newId = await db.transaction(async (tx) => {
    const [w] = await tx
      .insert(workouts)
      .values({
        userId: null, // nullable until auth is added
        name: input.name,
        bodyParts: input.bodyParts,
        startedAt: input.startedAt ?? new Date(),
        finishedAt: input.finishedAt,
        durationSeconds: input.durationSeconds,
        notes: input.notes,
      })
      .returning({ id: workouts.id })
    await insertChildren(tx, w.id, input)
    return w.id
  })
  // Non-null: we just created it.
  return (await findWorkoutById(newId))!
}

/**
 * Replaces a workout and all of its exercises/sets in one transaction.
 * Children are deleted and re-inserted from the payload (aggregate write).
 * Returns null if the workout does not exist.
 */
export async function replaceWorkout(id: number, input: WorkoutInput): Promise<WorkoutDTO | null> {
  await assertExercisesExist(input)
  const ok = await db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: workouts.id }).from(workouts).where(eq(workouts.id, id))
    if (!existing) return false

    await tx
      .update(workouts)
      .set({
        name: input.name,
        bodyParts: input.bodyParts,
        startedAt: input.startedAt ?? undefined,
        finishedAt: input.finishedAt,
        durationSeconds: input.durationSeconds,
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(eq(workouts.id, id))

    // Cascade removes the dependent sets.
    await tx.delete(workoutExercises).where(eq(workoutExercises.workoutId, id))
    await insertChildren(tx, id, input)
    return true
  })
  if (!ok) return null
  return findWorkoutById(id)
}

/** Deletes a workout (cascades to exercises + sets). Returns false if not found. */
export async function deleteWorkout(id: number): Promise<boolean> {
  const deleted = await db.delete(workouts).where(eq(workouts.id, id)).returning({ id: workouts.id })
  return deleted.length > 0
}
