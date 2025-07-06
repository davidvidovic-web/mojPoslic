import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  // Prevent Prisma from running on the client-side or in edge runtime
  if (typeof window !== 'undefined') {
    throw new Error('PrismaClient cannot be instantiated on the client side')
  }
  
  // Check if we're in an edge runtime environment
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('PrismaClient cannot be instantiated in Edge Runtime')
  }
  
  return new PrismaClient({
    log: ['query'],
  }).$extends(withAccelerate())
}

// Only create Prisma client if not in edge runtime
function getPrismaClient() {
  try {
    return createPrismaClient()
  } catch (error) {
    // Return null if we can't create the client (e.g., in edge runtime)
    console.warn('Prisma client could not be created:', error)
    return null
  }
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  if (prisma) {
    globalForPrisma.prisma = prisma
  }
}
