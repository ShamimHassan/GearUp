import express from 'express'
import adminController from '../controllers/adminController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'
import { updateUserStatusSchema } from '../utils/validation'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticate, authorize(UserRole.ADMIN))

router.get('/users', adminController.getAllUsers)
router.patch('/users/:id', 
  async (req, res, next) => {
    try {
      await updateUserStatusSchema.parseAsync(req.body)
      next()
    } catch (error) {
      next(error)
    }
  },
  adminController.updateUserStatus
)
router.get('/gear', adminController.getAllGear)
router.get('/rentals', adminController.getAllRentals)

export default router
