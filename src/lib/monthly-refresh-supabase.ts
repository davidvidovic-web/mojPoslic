/**
 * Automatic monthly connections refresh script
 * This should be run on the 1st of each month via cron job or serverless function
 */

import { createClient } from '@supabase/supabase-js'
import { isTimeForMonthlyRefresh, MONTHLY_CONNECTIONS } from '@/lib/connections'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    console.log('🔄 Starting automatic monthly connections refresh...')

    // Get all tasker users who might need refresh
    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('id, role, connections_last_refresh')
      .eq('role', 'tasker')

    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`)
    }

    if (!users || users.length === 0) {
      console.log('📊 No tasker users found')
      return { success: true, refreshedUsers: 0, errors: [] }
    }

    console.log(`📊 Found ${users.length} tasker users to check`)

    // Process users in batches of 10 to avoid overwhelming the database
    const batchSize = 10
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (user) => {
          try {
            const lastRefresh = user.connections_last_refresh 
              ? new Date(user.connections_last_refresh) 
              : null

            if (isTimeForMonthlyRefresh(lastRefresh)) {
              console.log(`🔄 Refreshing connections for user ${user.id}`)

              // Update user's connections and last refresh date
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  available_connections: MONTHLY_CONNECTIONS,
                  connections_last_refresh: new Date().toISOString()
                })
                .eq('id', user.id)

              if (updateError) {
                throw new Error(`Failed to update user ${user.id}: ${updateError.message}`)
              }

              refreshedUsers++
              console.log(`✅ Refreshed connections for user ${user.id}`)
            } else {
              console.log(`⏭️ User ${user.id} not eligible for refresh yet`)
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error(`❌ Error processing user ${user.id}: ${errorMessage}`)
            errors.push(`User ${user.id}: ${errorMessage}`)
          }
        })
      )

      // Small delay between batches to be gentle on the database
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`🎉 Monthly refresh completed. Refreshed ${refreshedUsers} users`)
    
    return {
      success: errors.length === 0,
      refreshedUsers,
      errors
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Monthly refresh failed:', errorMessage)
    
    return {
      success: false,
      refreshedUsers,
      errors: [errorMessage, ...errors]
    }
  }
}

/**
 * Command line execution
 */
if (require.main === module) {
  performAutomaticMonthlyRefresh()
    .then((result) => {
      console.log('📊 Monthly refresh result:', result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('❌ Monthly refresh failed:', error)
      process.exit(1)
    })
}
