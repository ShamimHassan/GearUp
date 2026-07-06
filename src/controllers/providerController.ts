import { Request, Response, NextFunction } from 'express'
import prisma from '../config/prisma'
import { AppError } from '../middleware/errorHandler'
import { gearItemSchema } from '../utils/validation'
import { AuthRequest } from '../middleware/auth'

export const createGear = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = gearItemSchema.parse(req.body)
    
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    const gear = await prisma.gearItem.create({
      data: {
        ...data,
        providerId: req.user.id
      },
      include: {
        category: true,
        provider: { select: { id: true, name: true, email: true } }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Gear created successfully',
      data: gear
    })
  } catch (error) {
    next(error)
  }
}

export const updateGear = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const data = gearItemSchema.partial().parse(req.body)
    
    const gear = await prisma.gearItem.findUnique({
      where: { id }
    })

    if (!gear) {
      throw new AppError('Gear not found', 404)
    }

    if (gear.providerId !== req.user.id) {
      throw new AppError('Access denied', 403)
    }

    const updatedGear = await prisma.gearItem.update({
      where: { id },
      data,
      include: {
        category: true,
        provider: { select: { id: true, name: true, email: true } }
      }
    })

    res.status(200).json({
      success: true,
      message: 'Gear updated successfully',
      data: updatedGear
    })
  } catch (error) {
    next(error)
  }
}

export const deleteGear = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    const gear = await prisma.gearItem.findUnique({
      where: { id }
    })

    if (!gear) {
      throw new AppError('Gear not found', 404)
    }

    if (gear.providerId !== req.user.id) {
      throw new AppError('Access denied', 403)
    }

    await prisma.gearItem.delete({
      where: { id }
    })

    res.status(200).json({
      success: true,
      message: 'Gear deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const getProviderGear = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gear = await prisma.gearItem.findMany({
      where: { providerId: req.user.id },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.status(200).json({
      success: true,
      data: gear
    })
  } catch (error) {
    next(error)
  }
}

export const getProviderOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.rentalOrder.findMany({
      where: { gear: { providerId: req.user.id } },
      include: {
        gear: {
          include: {
            category: true
          }
        },
        customer: { select: { id: true, name: true, email: true } },
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

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const order = await prisma.rentalOrder.findUnique({
      where: { id },
      include: { gear: true }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (order.gear.providerId !== req.user.id) {
      throw new AppError('Access denied', 403)
    }

    const updatedOrder = await prisma.rentalOrder.update({
      where: { id },
      data: { status },
      include: {
        gear: {
          include: {
            category: true
          }
        },
        customer: { select: { id: true, name: true, email: true } },
        payment: true
      }
    })

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: updatedOrder
    })
  } catch (error) {
    next(error)
  }
}
