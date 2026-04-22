import { pgTable, serial, varchar, text, integer, decimal, boolean, timestamp } from 'drizzle-orm/pg-core'

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  equipment: varchar('equipment', { length: 100 }),
  primaryMuscles: text('primary_muscles'),
  isCustom: boolean('is_custom').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  finishedAt: timestamp('finished_at'),
  durationSeconds: integer('duration_seconds'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  orderIndex: integer('order_index').notNull(),
  restSeconds: integer('rest_seconds'),
  tempo: varchar('tempo', { length: 20 }),
  notes: text('notes'),
})

export const sets = pgTable('sets', {
  id: serial('id').primaryKey(),
  workoutExerciseId: integer('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps'),
  weight: decimal('weight', { precision: 6, scale: 2 }),
  notes: text('notes'),
})

export type Exercise = typeof exercises.$inferSelect
export type NewExercise = typeof exercises.$inferInsert

export type Workout = typeof workouts.$inferSelect
export type NewWorkout = typeof workouts.$inferInsert

export type WorkoutExercise = typeof workoutExercises.$inferSelect
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert

export type Set = typeof sets.$inferSelect
export type NewSet = typeof sets.$inferInsert
