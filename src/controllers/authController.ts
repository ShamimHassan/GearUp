import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma'
import { AppError } from '../middleware/errorHandler'
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../utils/validation'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new AppError('Email already exists', 400)
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body)
    
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403)
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401)
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    const { password, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body)
    const { email } = data
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingUser && existingUser.id !== req.user.id) {
        throw new AppError('Email already exists', 400)
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = changePasswordSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const isPasswordValid = await bcrypt.compare(data.oldPassword, user.password)

    if (!isPasswordValid) {
      throw new AppError('Old password is incorrect', 401)
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    })

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    next(error)
  }
}
