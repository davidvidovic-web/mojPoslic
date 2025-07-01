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
    console.log('Starting automatic monthly connections refresh...')

    // Get all users who need a monthly refresh using raw SQL for compatibility
    const users = await prisma.$queryRaw`
      SELECT id, name, email, connections_last_refresh, connections
      FROM users
    ` as Array<{
      id: string
      name: string
      email: string
      connections_last_refresh: Date | null
      connections: number
    }>

    console.log(`Found ${users.length} users to check for refresh eligibility`)

    // Process users in batches to avoid overwhelming the database
    const batchSize = 50
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      await Promise.allSettled(
        batch.map(async (user) => {
          try {
            // Check if user needs refresh
            if (!isTimeForMonthlyRefresh(user.connections_last_refresh)) {
              return // User doesn't need refresh yet
            }

            // Perform the refresh using raw SQL for compatibility
            await prisma.$transaction(async (tx) => {
              // Add monthly connections
              await tx.$executeRaw`
                UPDATE users 
                SET connections = connections + ${MONTHLY_CONNECTIONS},
                    connections_last_refresh = NOW()
                WHERE id = ${user.id}
              `

              // Log the refresh
              await tx.$executeRaw`
                INSERT INTO connection_history (id, user_id, action, amount, description, created_at)
                VALUES (gen_random_uuid()::text, ${user.id}, 'MONTHLY_REFRESH', ${MONTHLY_CONNECTIONS}, 'Automatic monthly connections refresh', NOW())
              `
            })

            refreshedUsers++
            console.log(`Refreshed connections for user ${user.id} (${user.email})`)
          } catch (error) {
            const errorMsg = `Failed to refresh user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }
        })
      )
    }

    console.log(`Monthly refresh completed. Refreshed ${refreshedUsers} users.`)
    
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
  console.log('Running manual monthly connections refresh...')
  
  performAutomaticMonthlyRefresh()
    .then((result) => {
      console.log('Refresh completed:', result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
