import express from 'express'
import { getAllGear, getGearById, getAllCategories } from '../controllers/gearController'

const router = express.Router()

router.get('/gear', getAllGear)
router.get('/gear/:id', getGearById)
router.get('/categories', getAllCategories)

export default router
