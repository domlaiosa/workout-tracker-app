import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import exercisesRouter from './routes/exercises.js'
import workoutsRouter from './routes/workouts.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/v1/exercises', exercisesRouter)
app.use('/api/v1/workouts', workoutsRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
