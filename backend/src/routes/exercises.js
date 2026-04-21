import { Router } from 'express'
import { db } from '../db/index.js'
import { exercises } from '../db/schema.js'
import { ilike, eq, and } from 'drizzle-orm'

const router = Router()

router.get('/', async (req, res) => {
  const { search, category } = req.query

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

router.post('/', async (req, res) => {
  const { name, category, equipment, primaryMuscles } = req.body
  if (!name || !category) {
    return res.status(400).json({ error: 'name and category are required' })
  }

  const [created] = await db
    .insert(exercises)
    .values({ name, category, equipment, primaryMuscles, isCustom: true })
    .returning()

  res.status(201).json(created)
})

export default router
