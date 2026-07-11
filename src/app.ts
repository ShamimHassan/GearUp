import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/authRoutes'
import gearRoutes from './routes/gearRoutes'
import providerRoutes from './routes/providerRoutes'
import rentalRoutes from './routes/rentalRoutes'
import paymentRoutes from './routes/payment.routes'
import reviewRoutes from './routes/reviewRoutes'
import adminRoutes from './routes/adminRoutes'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ success: true, message: 'GearUp API is running!' })
})

app.use('/api', gearRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/provider', providerRoutes)
app.use('/api/rentals', rentalRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', errorDetails: null })
})

app.use(errorHandler)

export default app
