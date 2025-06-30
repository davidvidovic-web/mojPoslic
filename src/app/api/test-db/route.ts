import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test basic table access
    const jobCount = await prisma.jobListing.count()
    const cityCount = await prisma.city.count()
    const categoryCount = await prisma.category.count()
    
    // Test a simple job query
    const sampleJob = await prisma.jobListing.findFirst({
      select: {
        id: true,
        title: true,
        cityId: true,
        categoryId: true
      }
    })

    return NextResponse.json({
      status: 'success',
      counts: {
        jobs: jobCount,
        cities: cityCount,
        categories: categoryCount
      },
      sampleJob
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
