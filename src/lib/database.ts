import { PrismaClient } from '@prisma/client'
import { neon } from '@neondatabase/serverless'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// For direct SQL queries with NEON (if needed)
export const sql = neon(process.env.DATABASE_URL!)