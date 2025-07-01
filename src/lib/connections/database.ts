/**
 * Connection database operations
 */

import { PrismaClient, ConnectionAction } from '@prisma/client'
import { MONTHLY_CONNECTIONS, INITIAL_CONNECTIONS } from './types'
import { getConnectionCost, hasEnoughConnections } from './utils'

/**
 * Checks if user needs monthly refresh (more than 30 days since last refresh)
 */
export function needsMonthlyRefresh(lastRefreshDate: Date | null): boolean {
  if (!lastRefreshDate) return true
  
  const now = new Date()
  const daysSinceRefresh = Math.floor(
    (now.getTime() - lastRefreshDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return daysSinceRefresh >= 30
}

/**
 * Performs monthly refresh of connections if eligible
 */
export async function performMonthlyRefresh(
  prisma: PrismaClient,
  userId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { connectionsLastRefresh: true }
    })

    if (!user || !needsMonthlyRefresh(user.connectionsLastRefresh)) {
      return false
    }

    await prisma.$transaction(async (tx) => {
      // Add monthly connections
      await tx.user.update({
        where: { id: userId },
        data: {
          connections: { increment: MONTHLY_CONNECTIONS },
          connectionsLastRefresh: new Date()
        }
      })

      // Log the refresh
      await tx.connectionHistory.create({
        data: {
          userId,
          action: 'MONTHLY_REFRESH',
          amount: MONTHLY_CONNECTIONS,
          description: 'Monthly connections refresh'
        }
      })
    })

    return true
  } catch (error) {
    console.error('Error performing monthly refresh:', error)
    return false
  }
}

/**
 * Spends connections for an action and logs it
 */
export async function spendConnections(
  prisma: PrismaClient,
  userId: string,
  action: keyof typeof import('./types').CONNECTION_COSTS,
  jobId?: string,
  description?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const cost = getConnectionCost(action)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { connections: true }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    if (!hasEnoughConnections(user.connections, action)) {
      return { 
        success: false, 
        error: `Insufficient connections. You need ${cost} connections but only have ${user.connections}.` 
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Deduct connections
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { connections: { decrement: cost } }
      })

      // Log the transaction
      await tx.connectionHistory.create({
        data: {
          userId,
          action: 'JOB_APPLICATION' as ConnectionAction, // Use specific enum value
          amount: -cost,
          description: description || `Used ${cost} connections for ${action}`,
          jobId
        }
      })

      return updatedUser.connections
    })

    return { success: true, newBalance: result }
  } catch (error) {
    console.error('Error spending connections:', error)
    return { success: false, error: 'Failed to spend connections' }
  }
}

/**
 * Initializes connections for a new user
 */
export async function initializeUserConnections(
  prisma: PrismaClient,
  userId: string
): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // Set initial connections
      await tx.user.update({
        where: { id: userId },
        data: {
          connections: INITIAL_CONNECTIONS,
          connectionsLastRefresh: new Date()
        }
      })

      // Log the initial grant
      await tx.connectionHistory.create({
        data: {
          userId,
          action: 'INITIAL_SIGNUP',
          amount: INITIAL_CONNECTIONS,
          description: 'Welcome bonus connections'
        }
      })
    })

    return true
  } catch (error) {
    console.error('Error initializing user connections:', error)
    return false
  }
}
