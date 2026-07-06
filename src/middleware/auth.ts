import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma'
import { AppError } from './errorHandler'
import { UserRole } from '@prisma/client'

export interface AuthRequest extends Request {
  user?: any
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new AppError('Authentication required', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })

    if (!user) {
      throw new AppError('User not found', 401)
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403)
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401)
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Access denied', 403)
    }

    next()
  }
}
