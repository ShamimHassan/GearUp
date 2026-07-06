import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  const errorDetails = err.errorDetails || null

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails
  })
}

export class AppError extends Error {
  statusCode: number
  errorDetails: any

  constructor(message: string, statusCode: number = 500, errorDetails: any = null) {
    super(message)
    this.statusCode = statusCode
    this.errorDetails = errorDetails
    Object.setPrototypeOf(this, AppError.prototype)
  }
}
