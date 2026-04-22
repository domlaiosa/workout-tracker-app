import { Router, type Request, type Response } from 'express'
import { db } from '../db/index.js'
import { exercises } from '../db/schema.js'
import { ilike, eq, and } from 'drizzle-orm'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const { search, category } = req.query as { search?: string; category?: string }

  const conditions = []
  if (search) conditions.push(ilike(exercises.name, `%${search}%`))
  if (category) conditions.push(eq(exercises.category, category))

  const rows = await db
    .select()
    .from(exercises)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(exercises.name)

  res.json(rows)
})

router.post('/', async (req: Request, res: Response) => {
  const { name, category, equipment, primaryMuscles } = req.body as {
    name?: string
    category?: string
    equipment?: string
    primaryMuscles?: string
  }

  if (!name || !category) {
    res.status(400).json({ error: 'name and category are required' })
    return
  }

  const [created] = await db
    .insert(exercises)
    .values({ name, category, equipment, primaryMuscles, isCustom: true })
    .returning()

  res.status(201).json(created)
})

export default router
