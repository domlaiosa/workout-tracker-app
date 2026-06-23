import { Router } from 'express'
import { listExercises, createExercise } from '../controllers/exercises.controller.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    await listExercises(req, res)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    await createExercise(req, res)
  } catch (err) {
    next(err)
  }
})

export default router
