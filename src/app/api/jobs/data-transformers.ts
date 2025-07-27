import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Delete a job listing by ID
 * @returns { success: boolean, error?: string, status?: number }
 */
export async function deleteJob(jobId: string, userId: string) {
  // Check if the job exists and belongs to the current user
  const existingJob = await prisma.jobListing.findFirst({
    where: {
      id: jobId,
      postedById: userId
    }
  })

  if (!existingJob) {
    return {
      success: false,
      error: 'Job not found or you do not have permission to delete it',
      status: 404
    }
  }

  // Delete the job
  await prisma.jobListing.delete({
    where: {
      id: jobId
    }
  })

  return { success: true }
}

/**
 * Transform job data for API response
 */
export function transformJobData(
  job: Record<string, unknown>,
  city: Record<string, unknown>,
  category: Record<string, unknown>,
  postedBy: Record<string, unknown>
) {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    benefits: job.benefits,
    salary: job.salary,
    salaryType: job.salaryType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    type: job.type,
    jobType: job.type, // Alias for compatibility
    email: job.email,
    website: job.website,
    applicationUrl: job.applicationUrl,
    application_url: job.applicationUrl, // Alias for compatibility
    contactEmail: job.contactEmail,
    contact_email: job.contactEmail, // Alias for compatibility
    jobAddress: job.jobAddress,
    job_address: job.jobAddress, // Alias for compatibility
    jobLatitude: job.jobLatitude,
    job_latitude: job.jobLatitude, // Alias for compatibility
    jobLongitude: job.jobLongitude,
    job_longitude: job.jobLongitude, // Alias for compatibility
    startDate: job.startDate,
    start_date: job.startDate, // Alias for compatibility
    isFeatured: job.isFeatured,
    tags: job.tags,
    expiresAt: job.expiresAt,
    expires_at: job.expiresAt, // Alias for compatibility
    isActive: job.isActive,
    posted_by: job.postedById, // Alias for compatibility
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    posted_at: job.createdAt, // Alias for compatibility
    city: city ? {
      id: city.id,
      key: city.key,
      name_bs: city.nameBS,
      name_en: city.nameEN,
      name: city.nameEN || city.nameBS // Convenience field
    } : null,
    category: category ? {
      id: category.id,
      key: category.key,
      name_bs: category.nameBS,
      name_en: category.nameEN,
      name: category.nameEN || category.nameBS // Convenience field
    } : null,
    postedBy: postedBy ? {
      id: postedBy.id,
      name: postedBy.name,
      email: postedBy.email
    } : null
  }
}
