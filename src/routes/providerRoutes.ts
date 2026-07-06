import express from 'express'
import {
  createGear,
  updateGear,
  deleteGear,
  getProviderGear,
  getProviderOrders,
  updateOrderStatus
} from '../controllers/providerController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '@prisma/client'

const router = express.Router()

router.use(authenticate, authorize(UserRole.PROVIDER))

router.post('/gear', createGear)
router.put('/gear/:id', updateGear)
router.delete('/gear/:id', deleteGear)
router.get('/gear', getProviderGear)
router.get('/orders', getProviderOrders)
router.patch('/orders/:id', updateOrderStatus)

export default router
