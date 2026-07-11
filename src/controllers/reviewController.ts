import { Response, NextFunction } from 'express'
import prisma from '../config/prisma'
import { AppError } from '../middleware/errorHandler'
import { UserRole, RentalStatus } from '@prisma/client'

const createReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { rating, comment, gearId } = req.body
    const userId = req.user.id as string

    // Check if customer has a completed rental for this gear
    const completedRental = await prisma.rentalOrder.findFirst({
      where: {
        customerId: userId,
        gearId,
        status: RentalStatus.RETURNED
      }
    })

    if (!completedRental) {
      throw new AppError('You can only review gear you have rented and returned', 403)
    }

    // Check if review already exists for this gear and customer
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        gearId
      }
    })

    if (existingReview) {
      throw new AppError('You have already reviewed this gear', 400)
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        gearId,
        userId
      }
    })

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    })
  } catch (error) {
    next(error)
  }
}

export default {
  createReview
}
