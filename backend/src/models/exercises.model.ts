import { ilike, or, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { exerciseLibrary } from '../db/schema.js'
import type { NewExerciseLibrary } from '../db/schema.js'

export async function findAllExercises(search?: string, category?: string) {
  const conditions = []

  if (search) {
    conditions.push(ilike(exerciseLibrary.name, `%${search}%`))
  }

  if (category) {
    conditions.push(eq(exerciseLibrary.category, category))
  }

  if (conditions.length === 0) {
    return db.select().from(exerciseLibrary)
  }

  if (conditions.length === 1) {
    return db.select().from(exerciseLibrary).where(conditions[0])
  }

  return db.select().from(exerciseLibrary).where(or(...conditions))
}

export async function insertExercise(data: NewExerciseLibrary) {
  const [created] = await db.insert(exerciseLibrary).values(data).returning()
  return created
}
