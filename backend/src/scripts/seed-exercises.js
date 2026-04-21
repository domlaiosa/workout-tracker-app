import 'dotenv/config'
import { db } from '../db/index.js'
import { exercises } from '../db/schema.js'

// Category mapping: derive body-part category from primaryMuscles
const muscleToCategory = {
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

function deriveCategory(exercise) {
  if (exercise.category === 'cardio') return 'Cardio'
  const primary = exercise.primaryMuscles?.[0]?.toLowerCase()
  return muscleToCategory[primary] ?? 'Other'
}

async function seed() {
  // free-exercise-db must be installed: npm install free-exercise-db
  const { default: data } = await import('free-exercise-db/dist/exercises.json', {
    assert: { type: 'json' },
  })

  const rows = data.map((ex) => ({
    name: ex.name,
    category: deriveCategory(ex),
    equipment: ex.equipment ?? null,
    primaryMuscles: ex.primaryMuscles?.join(', ') ?? null,
    isCustom: false,
  }))

  console.log(`Seeding ${rows.length} exercises...`)

  // Upsert: skip on duplicate name
  await db.insert(exercises).values(rows).onConflictDoNothing()

  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
