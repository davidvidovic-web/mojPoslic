import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ApplicationStatus } from '@/types/application'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const jobIdParam = searchParams.get('jobId')
    const searchParam = searchParams.get('search')
    const dateFromParam = searchParams.get('dateFrom')
    const dateToParam = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build where clause
    const where: {
      userId: string
      status?: { in: ApplicationStatus[] }
      jobId?: string
      appliedAt?: { gte?: Date; lte?: Date }
      job?: {
        OR: Array<{
          title?: { contains: string; mode: 'insensitive' }
          company?: { contains: string; mode: 'insensitive' }
        }>
      }
    } = {
      userId: session.user.id
    }

    // Filter by status
    if (statusParam) {
      const statuses = statusParam.split(',') as ApplicationStatus[]
      where.status = { in: statuses }
    }

    // Filter by job ID
    if (jobIdParam) {
      where.jobId = jobIdParam
    }

    // Date range filter
    if (dateFromParam || dateToParam) {
      where.appliedAt = {}
      if (dateFromParam) {
        where.appliedAt.gte = new Date(dateFromParam)
      }
      if (dateToParam) {
        where.appliedAt.lte = new Date(dateToParam)
      }
    }

    // Search filter (search in job title, company)
    if (searchParam) {
      where.job = {
        OR: [
          { title: { contains: searchParam, mode: 'insensitive' } },
          { company: { contains: searchParam, mode: 'insensitive' } }
        ]
      }
    }

    // Get applications with pagination
    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              type: true,
              salary: true,
              salaryMin: true,
              salaryMax: true,
              status: true,
              createdAt: true,
              expiresAt: true,
              city: {
                select: {
                  id: true,
                  nameEN: true,
                  nameBS: true
                }
              },
              category: {
                select: {
                  id: true,
                  nameEN: true,
                  nameBS: true
                }
              },
              postedBy: {
                select: {
                  id: true,
                  name: true,
                  companyName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.application.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Calculate stats
    const stats = {
      total: totalCount,
      pending: await prisma.application.count({ 
        where: { ...where, status: ApplicationStatus.PENDING } 
      }),
      reviewed: await prisma.application.count({ 
        where: { ...where, status: ApplicationStatus.REVIEWED } 
      }),
      shortlisted: await prisma.application.count({ 
        where: { ...where, status: ApplicationStatus.SHORTLISTED } 
      }),
      selected: await prisma.application.count({ 
        where: { ...where, status: ApplicationStatus.SELECTED } 
      }),
      rejected: await prisma.application.count({ 
        where: { ...where, status: ApplicationStatus.REJECTED } 
      }),
      withdrawn: await prisma.application.count({ 
        where: { ...where, status: ApplicationStatus.WITHDRAWN } 
      })
    }

    return NextResponse.json({
      success: true,
      applications,
      stats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Get user applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
