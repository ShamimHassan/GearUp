import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ success: true, message: 'GearUp API is running!' })
})

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', errorDetails: null })
})

export default app
