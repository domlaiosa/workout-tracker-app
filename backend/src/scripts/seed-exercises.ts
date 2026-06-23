import "dotenv/config";
import { db } from "../db/index.js";
import { exerciseLibrary } from "../db/schema.js";
import type { NewExerciseLibrary } from "../db/schema.js";

interface RawExercise {
  id: string;
  name: string;
  force?: string;
  level: string;
  mechanic?: string;
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions: string[];
  category: string;
  images?: string[];
}

async function seed(): Promise<void> {
  console.log("Fetching exercises from GitHub...");
  const response = await fetch(
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.statusText}`);
  }
  const data = (await response.json()) as RawExercise[];

  const rows: NewExerciseLibrary[] = data.map((ex) => ({
    slug: ex.id,
    name: ex.name,
    force: ex.force ?? null,
    level: ex.level,
    mechanic: ex.mechanic ?? null,
    equipment: ex.equipment ?? null,
    primaryMuscles: ex.primaryMuscles,
    secondaryMuscles: ex.secondaryMuscles ?? [],
    instructions: ex.instructions,
    category: ex.category,
    images: ex.images ?? [],
    isCustom: false,
  }));

  console.log(`Seeding ${rows.length} exercises...`);

  await db.insert(exerciseLibrary).values(rows).onConflictDoNothing();

  console.log("Done.");
  process.exit(0);
}

seed().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
