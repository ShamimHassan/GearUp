import { Request, Response, NextFunction } from 'express'
import prisma from '../config/prisma'
import { AppError } from '../middleware/errorHandler'

export const getAllGear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, minPrice, maxPrice, brand, search } = req.query

    const where: any = {
      isAvailable: true
    }

    if (category) {
      const categoryDoc = await prisma.category.findFirst({
        where: { name: { equals: category as string, mode: 'insensitive' } }
      })
      if (categoryDoc) {
        where.categoryId = categoryDoc.id
      }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice as string)
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string)
    }

    if (brand) {
      where.brand = { equals: brand as string, mode: 'insensitive' }
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const gear = await prisma.gearItem.findMany({
      where,
      include: {
        category: true,
        provider: { select: { id: true, name: true, email: true } },
        reviews: true
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

export const getGearById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const gear = await prisma.gearItem.findUnique({
      where: { id },
      include: {
        category: true,
        provider: { select: { id: true, name: true, email: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    })

    if (!gear) {
      throw new AppError('Gear not found', 404)
    }

    res.status(200).json({
      success: true,
      data: gear
    })
  } catch (error) {
    next(error)
  }
}

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })

    res.status(200).json({
      success: true,
      data: categories
    })
  } catch (error) {
    next(error)
  }
}

export const getGearReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const gear = await prisma.gearItem.findUnique({
      where: { id },
    })

    if (!gear) {
      throw new AppError('Gear not found', 404)
    }

    const reviews = await prisma.review.findMany({
      where: { gearId: id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    })

    res.status(200).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    next(error)
  }
}
