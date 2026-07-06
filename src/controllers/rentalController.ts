import { Request, Response, NextFunction } from 'express'
import prisma from '../config/prisma'
import { AppError } from '../middleware/errorHandler'
import { rentalOrderSchema } from '../utils/validation'
import { AuthRequest } from '../middleware/auth'
import { RentalStatus } from '@prisma/client'

export const createRentalOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = rentalOrderSchema.parse(req.body)
    
    const gear = await prisma.gearItem.findUnique({
      where: { id: data.gearId }
    })

    if (!gear) {
      throw new AppError('Gear not found', 404)
    }

    if (!gear.isAvailable || gear.stock <= 0) {
      throw new AppError('Gear is not available', 400)
    }

    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    if (startDate >= endDate) {
      throw new AppError('End date must be after start date', 400)
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalAmount = gear.price.toNumber() * days

    const order = await prisma.rentalOrder.create({
      data: {
        startDate,
        endDate,
        totalAmount,
        customerId: req.user.id,
        gearId: data.gearId,
        status: RentalStatus.PLACED
      },
      include: {
        gear: {
          include: {
            provider: { select: { id: true, name: true, email: true } },
            category: true
          }
        },
        payment: true
      }
    })

    res.status(201).json({
      success: true,
      message: 'Rental order created successfully',
      data: order
    })
  } catch (error) {
    next(error)
  }
}

export const getMyRentals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.rentalOrder.findMany({
      where: { customerId: req.user.id },
      include: {
        gear: {
          include: {
            provider: { select: { id: true, name: true, email: true } },
            category: true
          }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.status(200).json({
      success: true,
      data: orders
    })
  } catch (error) {
    next(error)
  }
}

export const getRentalById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const order = await prisma.rentalOrder.findUnique({
      where: { id },
      include: {
        gear: {
          include: {
            provider: { select: { id: true, name: true, email: true } },
            category: true
          }
        },
        payment: true
      }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (
      order.customerId !== req.user.id &&
      (req.user.role !== 'PROVIDER' || order.gear.providerId !== req.user.id) &&
      req.user.role !== 'ADMIN'
    ) {
      throw new AppError('Access denied', 403)
    }

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    next(error)
  }
}
