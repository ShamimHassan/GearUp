import { Response, NextFunction } from 'express'
import prisma from '../config/prisma'
import { AppError } from '../middleware/errorHandler'
import { UserRole } from '@prisma/client'

const getAllUsers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true
      }
    })
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    })
  } catch (error) {
    next(error)
  }
}

const updateUserStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new AppError('User not found', 404)

    // Don't allow updating admin's own status
    if (id === req.user.id) {
      throw new AppError('You cannot update your own status', 403)
    }

    // Don't allow updating other admins' statuses
    if (user.role === UserRole.ADMIN) {
      throw new AppError('You cannot update an admin\'s status', 403)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    })
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser
    })
  } catch (error) {
    next(error)
  }
}

const getAllGear = async (req: any, res: Response, next: NextFunction) => {
  try {
    const gear = await prisma.gearItem.findMany({
      include: {
        provider: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true }
        },
        reviews: true
      }
    })
    res.status(200).json({
      success: true,
      message: 'Gear retrieved successfully',
      data: gear
    })
  } catch (error) {
    next(error)
  }
}

const getAllRentals = async (req: any, res: Response, next: NextFunction) => {
  try {
    const rentals = await prisma.rentalOrder.findMany({
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        gear: {
          select: { id: true, name: true, price: true }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.status(200).json({
      success: true,
      message: 'Rentals retrieved successfully',
      data: rentals
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals
}
