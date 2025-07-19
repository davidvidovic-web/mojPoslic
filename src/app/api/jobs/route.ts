import { NextResponse, NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { enrichJobsWithStaticData } from '@/lib/job-helpers'
import type { JobListing } from '@prisma/client'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    
    // Build where clause based on filters
    const where: {
      isActive: boolean
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        company?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
      cityId?: string
      categoryId?: string
      type?: 'quick_job' | 'full_time' | 'part_time' | 'remote'
    } = {
      isActive: true
    }
    
    // Search filter - search in title, company, description
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // City filter
    if (city && city !== 'all') {
      where.cityId = city
    }
    
    // Category filter
    if (category && category !== 'all') {
      where.categoryId = category
    }
    
    // Job type filter
    if (type && type !== 'all') {
      const typeMap: { [key: string]: string } = {
        'quick_job': 'quick_job',
        'full_time': 'full_time', 
        'part_time': 'part_time',
        'remote': 'remote'
      }
      const mappedType = typeMap[type] || type
      if (['quick_job', 'full_time', 'part_time', 'remote'].includes(mappedType)) {
        where.type = mappedType as 'quick_job' | 'full_time' | 'part_time' | 'remote'
      }
    }
    
    // Get filtered job data with timeout
    const jobsPromise = prisma.jobListing.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database timeout')), 8000) // 8 second timeout
    })

    const jobs = await Promise.race([jobsPromise, timeoutPromise]) as JobListing[]

    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json({ error: 'No jobs found' }, { status: 404 })
    }

    // Transform jobs with static data instead of manual DB joins
    const baseJobs = jobs.map((job: JobListing) => ({
      ...job,
      posted_at: job.createdAt.toISOString(),
      start_date: job.startDate ? job.startDate.toISOString() : null,
      job_address: job.jobAddress,
      job_latitude: job.jobLatitude, 
      job_longitude: job.jobLongitude,
      application_url: job.applicationUrl,
      contact_email: job.contactEmail,
      expires_at: job.expiresAt ? job.expiresAt.toISOString() : null,
      city_id: job.cityId,
      category_id: job.categoryId,
      is_featured: job.isFeatured, // Explicitly map isFeatured to is_featured
    }))

    // Enrich with static city and category data
    const transformedJobs = await enrichJobsWithStaticData(baseJobs)

    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    
    // Return more specific error for timeouts
    if (error instanceof Error && error.message === 'Database timeout') {
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
