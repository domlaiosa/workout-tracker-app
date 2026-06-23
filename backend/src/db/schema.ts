import { pgTable, serial, varchar, text, integer, decimal, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core'

export const exerciseLibrary = pgTable('exercise_library', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  force: varchar('force', { length: 50 }),
  level: varchar('level', { length: 50 }),
  mechanic: varchar('mechanic', { length: 50 }),
  equipment: varchar('equipment', { length: 100 }),
  primaryMuscles: jsonb('primary_muscles'),
  secondaryMuscles: jsonb('secondary_muscles'),
  instructions: jsonb('instructions'),
  category: varchar('category', { length: 100 }),
  images: jsonb('images'),
  isCustom: boolean('is_custom').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  // Target body parts (e.g. ["Chest", "Triceps"]). Drives the auto-generated name and the header chips.
  bodyParts: jsonb('body_parts').$type<string[]>().default([]).notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  finishedAt: timestamp('finished_at'),
  durationSeconds: integer('duration_seconds'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // user_id is nullable until auth lands; index it now so per-user queries stay fast afterwards.
  index('workouts_user_id_idx').on(table.userId),
])

export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exerciseLibrary.id),
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
  // Whether the set was checked off as completed during the session.
  completed: boolean('completed').default(false).notNull(),
  notes: text('notes'),
})

export type ExerciseLibrary = typeof exerciseLibrary.$inferSelect
export type NewExerciseLibrary = typeof exerciseLibrary.$inferInsert

export type Workout = typeof workouts.$inferSelect
export type NewWorkout = typeof workouts.$inferInsert

export type WorkoutExercise = typeof workoutExercises.$inferSelect
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert

export type Set = typeof sets.$inferSelect
export type NewSet = typeof sets.$inferInsert
