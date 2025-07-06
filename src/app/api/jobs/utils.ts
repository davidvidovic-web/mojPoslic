import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

/**
 * Fetches a job listing by ID with basic information
 */
export async function getJobById(jobId: string) {
  return await prisma.jobListing.findFirst({
    where: {
      id: jobId,
      isActive: true
    }
  })
}

/**
 * Fetches a city by ID
 */
export async function getCityById(cityId: string | null) {
  if (!cityId) return null
  
  return await prisma.city.findUnique({
    where: { id: cityId }
  })
}

/**
 * Fetches a category by ID
 */
export async function getCategoryById(categoryId: string | null) {
  if (!categoryId) return null
  
  return await prisma.category.findUnique({
    where: { id: categoryId }
  })
}

/**
 * Fetches basic user information by ID
 */
export async function getUserBasicInfo(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })
}

/**
 * Handles job application logic
 */
export async function applyToJob(jobId: string, userId: string) {
  // Check if already applied
  const existingApplication = await prisma.application.findFirst({
    where: {
      jobId,
      userId
    }
  })

  if (existingApplication) {
    return { 
      success: false, 
      error: 'You have already applied to this job',
      status: 400
    }
  }

  // Create application
  await prisma.application.create({
    data: {
      jobId,
      userId,
      status: 'PENDING'
    }
  })

  return { success: true }
}

/**
 * Updates job status (active/inactive)
 */
export async function updateJobStatus(jobId: string, isActive: boolean, userId: string) {
  // Check if user owns the job
  const job = await prisma.jobListing.findFirst({
    where: { 
      id: jobId,
      postedById: userId
    }
  })
  
  if (!job) {
    return { 
      success: false, 
      error: 'Job not found or you do not have permission to update it',
      status: 403
    }
  }
  
  await prisma.jobListing.update({
    where: { id: jobId },
    data: { isActive }
  })

  return { success: true }
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}
