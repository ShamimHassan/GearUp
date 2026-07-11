import express from 'express'
import { register, login, getCurrentUser, updateProfile, changePassword } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, getCurrentUser)
router.put('/me', authenticate, updateProfile)
router.patch('/change-password', authenticate, changePassword)

export default router
