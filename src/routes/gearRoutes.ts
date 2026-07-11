import express from 'express'
import { getAllGear, getGearById, getAllCategories, getGearReviews } from '../controllers/gearController'

const router = express.Router()

router.get('/gear', getAllGear)
router.get('/gear/:id', getGearById)
router.get('/gear/:id/reviews', getGearReviews)
router.get('/categories', getAllCategories)

export default router
