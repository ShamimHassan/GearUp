import express from 'express'
import {
  createRentalOrder,
  getMyRentals,
  getRentalById
} from '../controllers/rentalController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'

const router = express.Router()

router.use(authenticate)

router.post('/', authorize(UserRole.CUSTOMER), createRentalOrder)
router.get('/', getMyRentals)
router.get('/:id', getRentalById)

export default router
