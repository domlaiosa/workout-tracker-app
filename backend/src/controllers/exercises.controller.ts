import type { Request, Response } from 'express'
import { findAllExercises, insertExercise } from '../models/exercises.model.js'

export async function listExercises(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const category = typeof req.query.category === 'string' ? req.query.category : undefined

  const exercises = await findAllExercises(search, category)
  res.json(exercises)
}

export async function createExercise(req: Request, res: Response): Promise<void> {
  const { name, category } = req.body

  if (!name || !category) {
    res.status(400).json({ error: 'name and category are required' })
    return
  }

  const exercise = await insertExercise({
    name,
    category,
    isCustom: true,
  })

  res.status(201).json(exercise)
}
