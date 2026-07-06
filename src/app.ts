import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/authRoutes'
import gearRoutes from './routes/gearRoutes'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ success: true, message: 'GearUp API is running!' })
})

app.use('/api', gearRoutes)
app.use('/api/auth', authRoutes)

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', errorDetails: null })
})

app.use(errorHandler)

export default app
