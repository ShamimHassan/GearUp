import { z } from 'zod'
import { UserRole, RentalStatus, PaymentMethod, PaymentStatus } from '@prisma/client'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([UserRole.CUSTOMER, UserRole.PROVIDER]),
  phone: z.string().optional(),
  address: z.string().optional()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const gearItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  images: z.array(z.string()).optional(),
  categoryId: z.string().uuid('Invalid category ID')
})

export const rentalOrderSchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  gearId: z.string().uuid('Invalid gear ID')
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
  gearId: z.string().uuid('Invalid gear ID')
})

export const paymentCreateSchema = z.object({
  rentalOrderId: z.string().uuid('Invalid rental order ID'),
  method: z.enum([PaymentMethod.STRIPE, PaymentMethod.SSLCOMMERZ])
})
