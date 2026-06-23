import type { Request, Response } from 'express'
import {
  findAllWorkouts,
  findWorkoutById,
  createWorkout,
  replaceWorkout,
  deleteWorkout,
} from '../models/workouts.model.js'
import { parseWorkoutInput, parseId } from '../validation/workout.js'
import { notFound } from '../lib/httpError.js'

export async function listWorkouts(_req: Request, res: Response): Promise<void> {
  const workouts = await findAllWorkouts()
  res.json(workouts)
}

export async function getWorkout(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  const workout = await findWorkoutById(id)
  if (!workout) throw notFound('Workout not found')
  res.json(workout)
}

export async function postWorkout(req: Request, res: Response): Promise<void> {
  const input = parseWorkoutInput(req.body)
  const created = await createWorkout(input)
  res.status(201).json(created)
}

export async function putWorkout(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  const input = parseWorkoutInput(req.body)
  const updated = await replaceWorkout(id, input)
  if (!updated) throw notFound('Workout not found')
  res.json(updated)
}

export async function removeWorkout(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  const ok = await deleteWorkout(id)
  if (!ok) throw notFound('Workout not found')
  res.status(204).end()
}
