import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      company,
      description,
      type,
      city_id,
      // category_id, // TODO: Implement after schema sync
      salary,
      salaryType,
      salaryMin,
      salaryMax,
      website,
      email,
      start_date,
      job_address,
      job_latitude,
      job_longitude,
      requirements,
      benefits,
      contact_email,
      application_url
    } = body

    // Validate required fields
    if (!title || !company || !description || !city_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate start date is not in the past
    if (start_date) {
      const startDate = new Date(start_date)
      const now = new Date()
      if (startDate < now) {
        return NextResponse.json(
          { error: 'Start date cannot be in the past' },
          { status: 400 }
        )
      }
    }

    // Build salary string from new salary format if provided
    let salaryString = salary
    if (salaryType && (salaryMin || salaryMax)) {
      let period = ''
      if (salaryType === 'hourly') {
        period = ' per hour'
      } else if (salaryType === 'daily') {
        period = ' per day'
      } else if (salaryType === 'weekly') {
        period = ' per week'
      } else if (salaryType === 'monthly') {
        period = ' per month'
      }
      
      if (salaryMin && salaryMax && salaryType !== 'fixed') {
        salaryString = `${salaryMin} - ${salaryMax} BAM${period}`
      } else if (salaryMin && !salaryMax) {
        if (salaryType === 'fixed') {
          salaryString = `${salaryMin} BAM`
        } else {
          salaryString = `From ${salaryMin} BAM${period}`
        }
      } else if (salaryMax && !salaryMin) {
        salaryString = `Up to ${salaryMax} BAM${period}`
      } else if (salaryMin && salaryMax && salaryType === 'fixed') {
        salaryString = `${salaryMin} - ${salaryMax} BAM`
      }
    }

    const job = await prisma.jobListing.create({
      data: {
        title,
        company,
        description,
        type,
        cityId: city_id,
        // categoryId: category_id || null, // TODO: Fix after schema sync
        salary: salaryString || null,
        website: website || null,
        email,
        // startDate: start_date ? new Date(start_date) : null, // TODO: Enable after schema sync
        jobAddress: job_address || null,
        jobLatitude: job_latitude || null,
        jobLongitude: job_longitude || null,
        requirements: requirements || null,
        benefits: benefits || null,
        contactEmail: contact_email || null,
        applicationUrl: application_url || null,
        postedById: session.user.id,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        posted_at: job.createdAt.toISOString(),
        city_id: job.cityId,
        category_id: null // TODO: Fix after schema sync
      }
    })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
