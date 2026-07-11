import app from './app'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000

// Only listen if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`)
  })
}

export default app

