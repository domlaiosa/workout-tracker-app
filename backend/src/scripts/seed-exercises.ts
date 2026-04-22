import 'dotenv/config'
import { db } from '../db/index.js'
import { exercises } from '../db/schema.js'
import type { NewExercise } from '../db/schema.js'

const muscleToCategory: Record<string, string> = {
  chest: 'Chest',
  biceps: 'Arms',
  triceps: 'Arms',
  forearms: 'Arms',
  lats: 'Back',
  'middle back': 'Back',
  'lower back': 'Back',
  traps: 'Back',
  shoulders: 'Shoulders',
  quadriceps: 'Legs',
  hamstrings: 'Legs',
  glutes: 'Legs',
  calves: 'Legs',
  abductors: 'Legs',
  adductors: 'Legs',
  abdominals: 'Core',
  neck: 'Other',
}

interface RawExercise {
  name: string
  category: string
  equipment?: string
  primaryMuscles?: string[]
}

function deriveCategory(exercise: RawExercise): string {
  if (exercise.category === 'cardio') return 'Cardio'
  const primary = exercise.primaryMuscles?.[0]?.toLowerCase()
  return (primary && muscleToCategory[primary]) ?? 'Other'
}

async function seed(): Promise<void> {
  const { default: data } = await import('free-exercise-db/dist/exercises.json', {
    with: { type: 'json' },
  }) as { default: RawExercise[] }

  const rows: NewExercise[] = data.map((ex) => ({
    name: ex.name,
    category: deriveCategory(ex),
    equipment: ex.equipment ?? null,
    primaryMuscles: ex.primaryMuscles?.join(', ') ?? null,
    isCustom: false,
  }))

  console.log(`Seeding ${rows.length} exercises...`)

  await db.insert(exercises).values(rows).onConflictDoNothing()

  console.log('Done.')
  process.exit(0)
}

seed().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
