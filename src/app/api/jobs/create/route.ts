import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'
import { formatClientName } from '@/lib/job-utils'

// Use a simple Prisma client for this endpoint
const simplePrisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('=== Job Creation API Called ===')
    
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    
    const userId = session.user.id

    // Get the user's info including role for connection cost calculation
    const user = await simplePrisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check user's connections using raw SQL (since TypeScript types might not be updated)
    const connectionResult = await simplePrisma.$queryRaw`
      SELECT connections 
      FROM users 
      WHERE id = ${userId}
    ` as Array<{ connections: number }>

    if (!connectionResult || connectionResult.length === 0) {
      return NextResponse.json(
        { error: 'Could not fetch user connections' },
        { status: 500 }
      )
    }

    const currentConnections = connectionResult[0].connections || 0

    // Calculate connection cost based on user role
    let connectionCost = 3 // Default for clients
    if (user.role === 'company') {
      connectionCost = 4
    } else if (user.role === 'client') {
      connectionCost = 3
    }

    // Check if user has enough connections
    if (currentConnections < connectionCost) {
      return NextResponse.json({ 
        error: `Insufficient connections. You need ${connectionCost} connections to post a job as ${user.role}, but you only have ${currentConnections}.`,
        requiredConnections: connectionCost,
        currentConnections
      }, { status: 400 })
    }

    // Format client name as "FirstName L."
    const formattedClientName = formatClientName(user.name)

    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
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
      application_url
    } = body

    // Validate required fields (company is no longer required as we generate it)
    if (!title || !description || !city_id || !email) {
      console.log('Missing required fields:', { title: !!title, description: !!description, city_id: !!city_id, email: !!email })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('=== Resolving City ===')
    // Resolve city key to city ID
    const city = await simplePrisma.city.findUnique({
      where: { key: city_id },
      select: { id: true, key: true }
    })
    console.log('City lookup result:', city)

    if (!city) {
      return NextResponse.json(
        { error: `City with key '${city_id}' not found` },
        { status: 400 }
      )
    }

    console.log('=== Resolving Category ===')
    // Resolve category key/ID to category ID if provided
    let resolvedCategoryId = null
    if (category_id) {
      console.log('Looking up category:', category_id)
      // Try to find by ID first (for new format), then by key (for backward compatibility)
      let category = await simplePrisma.category.findUnique({
        where: { id: category_id },
        select: { id: true, key: true }
      })
      console.log('Category lookup by ID result:', category)

      // If not found by ID, try to find by key
      if (!category) {
        console.log('Not found by ID, trying by key...')
        category = await simplePrisma.category.findUnique({
          where: { key: category_id },
          select: { id: true, key: true }
        })
        console.log('Category lookup by key result:', category)
      }

      if (!category) {
        return NextResponse.json(
          { error: `Category with key/id '${category_id}' not found` },
          { status: 400 }
        )
      }
      resolvedCategoryId = category.id
    }
    console.log('Resolved category ID:', resolvedCategoryId)

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

    console.log('=== Creating Job ===')
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
      isActive: true
    }
    console.log('Job data to create:', JSON.stringify(jobData, null, 2))

    // Create job and spend connections in a transaction
    const job = await simplePrisma.$transaction(async (tx) => {
      // Create the job
      const createdJob = await tx.jobListing.create({
        data: jobData
      })

      // Spend connections using raw SQL
      await tx.$executeRaw`
        UPDATE users 
        SET connections = connections - ${connectionCost}
        WHERE id = ${userId}
      `

      // Log connection usage using raw SQL
      const actionType = user.role === 'company' ? 'JOB_POST_COMPANY' : 'JOB_POST_CLIENT'
      await tx.$executeRaw`
        INSERT INTO connection_history (id, user_id, action, amount, description, job_id, created_at)
        VALUES (gen_random_uuid()::text, ${userId}, ${actionType}::"ConnectionAction", ${-connectionCost}, ${'Posted job as ' + user.role}, ${createdJob.id}, NOW())
      `

      return createdJob
    })

    console.log('Job created successfully with connections spent:', job.id)

    return NextResponse.json({
      success: true,
      connectionsSpent: connectionCost,
      remainingConnections: currentConnections - connectionCost,
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
    await simplePrisma.$disconnect()
  }
}
