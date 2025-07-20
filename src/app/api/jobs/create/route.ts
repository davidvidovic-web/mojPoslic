import { NextRequest, NextResponse } from 'next/server'
import { createSimplePrismaClient } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { formatClientName } from '@/lib/job-utils'
import { getCityByKey, getCategoryById, getCategoryByKey } from '@/lib/job-helpers'
import { staticDataManager } from '@/lib/static-data'

export async function POST(request: NextRequest) {
  const prisma = createSimplePrismaClient()
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    
    const userId = session.user.id

    // Get the user's info including role for connection cost calculation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check user's connections
    const userWithConnections = await prisma.user.findUnique({
      where: { id: userId },
      select: { connections: true }
    })

    if (!userWithConnections) {
      return NextResponse.json(
        { error: 'Could not fetch user connections' },
        { status: 500 }
      )
    }

    const currentConnections = userWithConnections.connections || 0

    // Get today's date range (start and end of day in UTC to avoid timezone issues)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfDay = new Date(today.getTime())
    const endOfDay = new Date(today.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours

    // Count jobs posted today by this user
    const todayJobCount = await prisma.jobListing.count({
      where: {
        postedById: userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // Determine if connections are needed (first job today is free, subsequent cost connections)
    const needsConnections = todayJobCount >= 1
    let connectionCost = 0

    if (needsConnections) {
      // Calculate connection cost based on user role
      if (user.role === 'company') {
        connectionCost = 4
      } else if (user.role === 'client') {
        connectionCost = 3
      }

      // Check if user has enough connections
      if (currentConnections < connectionCost) {
        return NextResponse.json({ 
          error: `Insufficient connections. You need ${connectionCost} connections to post additional jobs today (you've already posted ${todayJobCount} job${todayJobCount > 1 ? 's' : ''} today), but you only have ${currentConnections}.`,
          requiredConnections: connectionCost,
          currentConnections,
          todayJobCount
        }, { status: 400 })
      }
    }

    // Format client name as "FirstName L."
    const formattedClientName = formatClientName(user.name)

    const body = await request.json()
    const {
      title,
      description,
      type,
      city_id,
      category_id,
      salary,
      salaryType,
      salaryMin,
      salaryMax,
      website,
      email,
      start_date,
      start_time,
      duration,
      transportation,
      transportation_amount,
      job_address,
      job_latitude,
      job_longitude,
      requirements,
      benefits,
      contact_email,
      application_url,
      is_featured
    } = body

    // Validate required fields (company is no longer required as we generate it)
    if (!title || !description || !city_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Resolve city key to city ID using static data
    await staticDataManager.loadData() // Ensure data is loaded
    
    let city = null
    
    // First try to get city by key (string like 'sarajevo')
    if (typeof city_id === 'string' && isNaN(Number(city_id))) {
      city = getCityByKey(city_id)
    } 
    // If it's a numeric ID, convert to key first
    else {
      // Load cities and find by numeric ID, then get the key
      const cities = staticDataManager.getCities()
      const cityById = cities.find(c => c.id === Number(city_id))
      if (cityById) {
        city = getCityByKey(cityById.key)
      }
    }

    if (!city) {
      return NextResponse.json(
        { error: `City with identifier '${city_id}' not found` },
        { status: 400 }
      )
    }

    // Resolve category key/ID to category ID if provided using static data
    // Data is already loaded from the city lookup above
    let resolvedCategoryId = null
    if (category_id) {
      // Try to find by ID first (for new format), then by key (for backward compatibility)
      let category = getCategoryById(category_id)

      // If not found by ID, try to find by key
      if (!category) {
        category = getCategoryByKey(category_id)
      }

      if (!category) {
        return NextResponse.json(
          { error: `Category with key/id '${category_id}' not found` },
          { status: 400 }
        )
      }
      resolvedCategoryId = category.id
    }

    // Validate start date is not in the past
    if (start_date) {
      const startDate = new Date(start_date)
      const now = new Date()
      
      // Reset time to midnight for date-only comparison
      startDate.setHours(0, 0, 0, 0)
      now.setHours(0, 0, 0, 0)
      
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

    const jobData = {
      title,
      company: formattedClientName, // Use formatted client name instead of company field
      description,
      type,
      cityId: city.id, // Use resolved city ID
      categoryId: resolvedCategoryId,
      salary: salaryString || null,
      salaryType: salaryType || null,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      website: website || null,
      email,
      startDate: start_date ? new Date(start_date) : null,
      startTime: start_time || null,
      duration: duration || null,
      transportation: transportation || null,
      transportationAmount: transportation_amount || null,
      jobAddress: job_address || null,
      jobLatitude: job_latitude || null,
      jobLongitude: job_longitude || null,
      requirements: requirements || null,
      benefits: benefits || null,
      contactEmail: contact_email || null,
      applicationUrl: application_url || null,
      postedById: userId,
      isActive: true,
      isFeatured: is_featured || false
    }

    // Create job and spend connections in a transaction
    const job = await prisma.$transaction(async (tx) => {
      // Create the job
      const createdJob = await tx.jobListing.create({
        data: jobData
      })

      // Only spend connections if needed (not first job today)
      if (needsConnections && connectionCost > 0) {
        // Spend connections using Prisma
        await tx.user.update({
          where: { id: userId },
          data: { connections: { decrement: connectionCost } }
        })

        // Log connection usage using raw SQL
        const actionType = user.role === 'company' ? 'JOB_POST_COMPANY' : 'JOB_POST_CLIENT'
        await tx.$executeRaw`
          INSERT INTO connection_history (id, user_id, action, amount, description, job_id, created_at)
          VALUES (gen_random_uuid()::text, ${userId}, ${actionType}::"ConnectionAction", ${-connectionCost}, ${'Posted additional job today as ' + user.role}, ${createdJob.id}, NOW())
        `
      } else {
        // Log free job posting
        await tx.$executeRaw`
          INSERT INTO connection_history (id, user_id, action, amount, description, job_id, created_at)
          VALUES (gen_random_uuid()::text, ${userId}, ${'JOB_POST_FREE'}::"ConnectionAction", ${0}, ${'First job posted today (free)'}, ${createdJob.id}, NOW())
        `
      }

      return createdJob
    })


    return NextResponse.json({
      success: true,
      connectionsSpent: connectionCost,
      remainingConnections: currentConnections - connectionCost,
      wasFree: !needsConnections,
      todayJobCount: todayJobCount + 1, // Include the just posted job
      job: {
        ...job,
        posted_at: job.createdAt.toISOString(),
        city_id: job.cityId,
        category_id: job.categoryId,
        start_date: job.startDate ? job.startDate.toISOString() : null,
        start_time: start_time,
        duration: duration,
        transportation: transportation,
        transportation_amount: transportation_amount,
        job_address: job.jobAddress,
        job_latitude: job.jobLatitude,
        job_longitude: job.jobLongitude,
        contact_email: job.contactEmail,
        application_url: job.applicationUrl
      }
    })
  } catch (error) {
    console.error('Error creating job:', error)
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create job', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
