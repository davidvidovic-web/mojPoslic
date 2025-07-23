/**
 * Connection database operations
 */

import { PrismaClient, ConnectionAction } from '@prisma/client'
import { 
  MONTHLY_CONNECTIONS, 
  INITIAL_CONNECTIONS_TASKER, 
  INITIAL_CONNECTIONS_CLIENT,
  INITIAL_CONNECTIONS_ADMIN
} from './types'
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
 * Performs monthly refresh of connections if eligible (taskers only)
 */
export async function performMonthlyRefresh(
  prisma: PrismaClient,
  userId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        role: true,
        connectionsLastRefresh: true
      }
    })

    // Only taskers are eligible for monthly refresh
    if (!user || user.role !== 'tasker') {
      return false
    }

    if (!needsMonthlyRefresh(user.connectionsLastRefresh)) {
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
          description: 'Monthly connections refresh (tasker)'
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
      select: { 
        connections: true
      }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found'
      }
    }

    if (!hasEnoughConnections(user.connections, action)) {
      return { 
        success: false, 
        error: `Insufficient connections. Required: ${cost}, Current: ${user.connections}`
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
    return { 
      success: false, 
      error: 'Failed to spend connections'
    }
  }
}

/**
 * Initializes connections for a new user based on their role
 */
export async function initializeUserConnections(
  prisma: PrismaClient,
  userId: string,
  userRole: 'tasker' | 'client' | 'admin' = 'client'
): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // Set initial connections based on role
      let initialConnections: number
      let description: string
      
      switch (userRole) {
        case 'tasker':
          initialConnections = INITIAL_CONNECTIONS_TASKER
          description = 'Welcome bonus connections (monthly refresh eligible)'
          break
        case 'client':
          initialConnections = INITIAL_CONNECTIONS_CLIENT
          description = 'One-time client connections'
          break
        case 'admin':
          initialConnections = INITIAL_CONNECTIONS_ADMIN
          description = 'Admin welcome connections'
          break
        default:
          initialConnections = INITIAL_CONNECTIONS_CLIENT
          description = 'Welcome bonus connections'
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          connections: initialConnections,
          connectionsLastRefresh: new Date()
        }
      })

      // Log the initial grant
      await tx.connectionHistory.create({
        data: {
          userId,
          action: 'INITIAL_SIGNUP',
          amount: initialConnections,
          description
        }
      })
    })

    return true
  } catch (error) {
    console.error('Error initializing user connections:', error)
    return false
  }
}

/**
 * Updates connections when user changes role
 */
export async function updateConnectionsForRoleChange(
  prisma: PrismaClient,
  userId: string,
  newRole: 'tasker' | 'client' | 'admin'
): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // Set connections based on new role
      let newConnections: number
      let description: string
      
      switch (newRole) {
        case 'tasker':
          newConnections = INITIAL_CONNECTIONS_TASKER
          description = 'Role changed to tasker (monthly refresh eligible)'
          break
        case 'client':
          newConnections = INITIAL_CONNECTIONS_CLIENT
          description = 'Role changed to client (one-time connections)'
          break
        case 'admin':
          newConnections = INITIAL_CONNECTIONS_ADMIN
          description = 'Role changed to admin'
          break
        default:
          newConnections = INITIAL_CONNECTIONS_CLIENT
          description = 'Role change - default connections'
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          connections: newConnections,
          connectionsLastRefresh: new Date()
        }
      })

      // Log the role change grant
      await tx.connectionHistory.create({
        data: {
          userId,
          action: 'ROLE_CHANGE' as ConnectionAction,
          amount: newConnections,
          description
        }
      })
    })

    return true
  } catch (error) {
    console.error('Error updating connections for role change:', error)
    return false
  }
}
