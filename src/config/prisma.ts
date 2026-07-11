import { PrismaClient } from '@prisma/client'

// Singleton pattern to prevent exhausting DB connections in serverless environments
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
