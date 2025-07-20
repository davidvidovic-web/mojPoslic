/**
 * Automatic monthly connections refresh script
 * This should be run on the 1st of each month via cron job or serverless function
 */

import { PrismaClient } from '@prisma/client'
import { isTimeForMonthlyRefresh, MONTHLY_CONNECTIONS } from '@/lib/connections'

const prisma = new PrismaClient()

/**
 * Performs monthly refresh for all users who are eligible
 */
export async function performAutomaticMonthlyRefresh(): Promise<{
  success: boolean
  refreshedUsers: number
  errors: string[]
}> {
  const errors: string[] = []
  let refreshedUsers = 0

  try {

    // Get all users who need a monthly refresh
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        connectionsLastRefresh: true,
        connections: true
      }
    })


    // Process users in batches to avoid overwhelming the database
    const batchSize = 50
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      await Promise.allSettled(
        batch.map(async (user) => {
          try {
            // Check if user needs refresh
            if (!isTimeForMonthlyRefresh(user.connectionsLastRefresh)) {
              return // User doesn't need refresh yet
            }

            // Perform the refresh using Prisma
            await prisma.$transaction(async (tx) => {
              // Add monthly connections
              await tx.user.update({
                where: { id: user.id },
                data: {
                  connections: { increment: MONTHLY_CONNECTIONS },
                  connectionsLastRefresh: new Date()
                }
              })

              // Log the refresh
              await tx.$executeRaw`
                INSERT INTO connection_history (id, user_id, action, amount, description, created_at)
                VALUES (gen_random_uuid()::text, ${user.id}, 'MONTHLY_REFRESH'::"ConnectionAction", ${MONTHLY_CONNECTIONS}, 'Automatic monthly connections refresh', NOW())
              `
            })

            refreshedUsers++
          } catch (error) {
            const errorMsg = `Failed to refresh user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }
        })
      )
    }

    
    if (errors.length > 0) {
      console.error(`Encountered ${errors.length} errors during refresh:`, errors)
    }

    return {
      success: true,
      refreshedUsers,
      errors
    }
  } catch (error) {
    const errorMsg = `Critical error in monthly refresh: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(errorMsg)
    errors.push(errorMsg)
    
    return {
      success: false,
      refreshedUsers,
      errors
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Check if the automatic refresh should run today
 * Returns true if today is the 1st of the month
 */
export function shouldRunMonthlyRefresh(): boolean {
  const today = new Date()
  return today.getDate() === 1
}

// If this script is run directly (not imported)
if (require.main === module) {
  
  performAutomaticMonthlyRefresh()
    .then((result) => {
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
