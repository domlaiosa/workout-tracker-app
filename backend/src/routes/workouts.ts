import { Router } from 'express'
import {
  listWorkouts,
  getWorkout,
  postWorkout,
  putWorkout,
  removeWorkout,
} from '../controllers/workouts.controller.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    await listWorkouts(req, res)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    await getWorkout(req, res)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    await postWorkout(req, res)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    await putWorkout(req, res)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await removeWorkout(req, res)
  } catch (err) {
    next(err)
  }
})

export default router
