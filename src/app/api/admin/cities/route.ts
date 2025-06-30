import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Get all cities for admin management
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const cities = await prisma.city.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { nameEN: 'asc' }
      ]
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create new city
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { key, nameEN, nameBS, isSpecial, sortOrder, isActive } = await request.json()

    if (!key || !nameEN || !nameBS) {
      return NextResponse.json(
        { error: 'Key, English name, and Bosnian name are required' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existingCity = await prisma.city.findUnique({
      where: { key }
    })

    if (existingCity) {
      return NextResponse.json(
        { error: 'City with this key already exists' },
        { status: 400 }
      )
    }

    const city = await prisma.city.create({
      data: {
        key,
        nameEN,
        nameBS,
        isSpecial: isSpecial || false,
        sortOrder: sortOrder || 999,
        isActive: isActive !== false // Default to true
      }
    })

    return NextResponse.json(city, { status: 201 })
  } catch (error) {
    console.error('Error creating city:', error)
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update city
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id, key, nameEN, nameBS, isSpecial, sortOrder, isActive } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'City ID is required' },
        { status: 400 }
      )
    }

    const updatedCity = await prisma.city.update({
      where: { id },
      data: {
        key,
        nameEN,
        nameBS,
        isSpecial,
        sortOrder,
        isActive
      }
    })

    return NextResponse.json(updatedCity)
  } catch (error) {
    console.error('Error updating city:', error)
    return NextResponse.json(
      { error: 'Failed to update city' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Delete city
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('id')

    if (!cityId) {
      return NextResponse.json(
        { error: 'City ID is required' },
        { status: 400 }
      )
    }

    // Check if city is in use
    const jobCount = await prisma.jobListing.count({
      where: { cityId }
    })

    if (jobCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete city. It is used by ${jobCount} job(s).` },
        { status: 400 }
      )
    }

    await prisma.city.delete({
      where: { id: cityId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting city:', error)
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
