import express from 'express'
import reviewController from '../controllers/reviewController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'
import { reviewSchema } from '../utils/validation'

const router = express.Router()

router.post('/', 
  authenticate, 
  authorize(UserRole.CUSTOMER), 
  async (req, res, next) => {
    try {
      await reviewSchema.parseAsync(req.body)
      next()
    } catch (error) {
      next(error)
    }
  }, 
  reviewController.createReview
)

export default router
