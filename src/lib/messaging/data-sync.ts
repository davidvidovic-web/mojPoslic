/**
 * Data synchronization between Prisma (main DB) and Supabase (messaging DB)
 * This ensures messaging system has access to user and job data
 */

import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SyncUser {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: string
  updated_at: string
}

export interface SyncJob {
  id: string
  title: string
  company: string
  updated_at: string
}

/**
 * Sync user data from Prisma to Supabase
 */
export async function syncUserToSupabase(userId: string): Promise<void> {
  try {
    const supabase = createSupabaseAdmin()
    
    // Get user data from Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        updatedAt: true,
      }
    })

    if (!user) {
      throw new Error(`User ${userId} not found in Prisma`)
    }

    // Sync to Supabase users table
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl,
        role: user.role || 'job_seeker',
        updated_at: user.updatedAt.toISOString(),
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Error syncing user to Supabase:', error)
      throw error
    }

    console.log(`Successfully synced user ${userId} to Supabase`)
  } catch (error) {
    console.error(`Failed to sync user ${userId}:`, error)
    throw error
  }
}

/**
 * Sync job data from Prisma to Supabase
 */
export async function syncJobToSupabase(jobId: string): Promise<void> {
  try {
    const supabase = createSupabaseAdmin()
    
    // Get job data from Prisma
    const job = await prisma.jobListing.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        company: true,
        updatedAt: true,
      }
    })

    if (!job) {
      throw new Error(`Job ${jobId} not found in Prisma`)
    }

    // Sync to Supabase jobs table
    const { error } = await supabase
      .from('jobs')
      .upsert({
        id: job.id,
        title: job.title,
        company: job.company,
        updated_at: job.updatedAt.toISOString(),
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Error syncing job to Supabase:', error)
      throw error
    }

    console.log(`Successfully synced job ${jobId} to Supabase`)
  } catch (error) {
    console.error(`Failed to sync job ${jobId}:`, error)
    throw error
  }
}

/**
 * Batch sync multiple users
 */
export async function batchSyncUsers(userIds: string[]): Promise<void> {
  console.log(`Starting batch sync for ${userIds.length} users`)
  
  for (const userId of userIds) {
    try {
      await syncUserToSupabase(userId)
    } catch (error) {
      console.error(`Failed to sync user ${userId}:`, error)
      // Continue with other users
    }
  }
  
  console.log('Batch user sync completed')
}

/**
 * Batch sync multiple jobs
 */
export async function batchSyncJobs(jobIds: string[]): Promise<void> {
  console.log(`Starting batch sync for ${jobIds.length} jobs`)
  
  for (const jobId of jobIds) {
    try {
      await syncJobToSupabase(jobId)
    } catch (error) {
      console.error(`Failed to sync job ${jobId}:`, error)
      // Continue with other jobs
    }
  }
  
  console.log('Batch job sync completed')
}

/**
 * Get user data from Supabase with fallback to Prisma
 */
export async function getUserData(userId: string): Promise<SyncUser | null> {
  try {
    const supabase = createSupabaseAdmin()
    
    // Try Supabase first
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && user) {
      return user
    }

    console.log(`User ${userId} not found in Supabase, falling back to Prisma`)
    
    // Fallback to Prisma and sync
    await syncUserToSupabase(userId)
    
    // Try Supabase again
    const { data: syncedUser, error: syncError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (syncError) {
      console.error('Error getting user after sync:', syncError)
      return null
    }

    return syncedUser
  } catch (error) {
    console.error(`Error getting user data for ${userId}:`, error)
    return null
  }
}

/**
 * Get job data from Supabase with fallback to Prisma
 */
export async function getJobData(jobId: string): Promise<SyncJob | null> {
  try {
    const supabase = createSupabaseAdmin()
    
    // Try Supabase first
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (!error && job) {
      return job
    }

    console.log(`Job ${jobId} not found in Supabase, falling back to Prisma`)
    
    // Fallback to Prisma and sync
    await syncJobToSupabase(jobId)
    
    // Try Supabase again
    const { data: syncedJob, error: syncError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (syncError) {
      console.error('Error getting job after sync:', syncError)
      return null
    }

    return syncedJob
  } catch (error) {
    console.error(`Error getting job data for ${jobId}:`, error)
    return null
  }
}

/**
 * Initialize sync system - sync all existing users and jobs
 */
export async function initializeSync(): Promise<void> {
  try {
    console.log('Initializing data sync...')
    
    // Get all user IDs from Prisma
    const users = await prisma.user.findMany({
      select: { id: true }
    })
    
    // Get all job IDs from Prisma
    const jobs = await prisma.jobListing.findMany({
      select: { id: true }
    })
    
    // Batch sync
    await batchSyncUsers(users.map(u => u.id))
    await batchSyncJobs(jobs.map(j => j.id))
    
    console.log('Data sync initialization completed')
  } catch (error) {
    console.error('Error initializing sync:', error)
    throw error
  }
}
