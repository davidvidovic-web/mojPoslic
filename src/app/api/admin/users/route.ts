import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        createdAt: true,
        _count: {
          select: {
            postedJobs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

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

    const body = await request.json()
    const { userId, role } = body
    
    console.log('Updating user role:', { userId, role })

    if (!userId || !role) {
      console.error('Missing required fields:', { userId, role })
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Validate role value
    const validRoles = ['admin', 'client', 'tasker', 'company']
    if (!validRoles.includes(role)) {
      console.error('Invalid role provided:', role)
      return NextResponse.json(
        { error: 'Invalid role value' },
        { status: 400 }
      )
    }

    console.log('Looking up user before update:', userId)
    const userBeforeUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    })
    console.log('User before update:', userBeforeUpdate)

    // Convert the string role to a proper Prisma enum value
    // We'll use the Prisma raw query to update the role to avoid type issues
    const updatedUser = await prisma.$queryRaw`
      UPDATE users 
      SET role = ${role}::user_role 
      WHERE id = ${userId}
      RETURNING id, email, name, role, company_name as "companyName", created_at as "createdAt"
    `
    
    // Extract the first result from the raw query
    const result = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser
    
    console.log('User after update with raw query:', result)
    
    console.log('User after update:', updatedUser)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user role:', error)
    
    // Add more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check for Prisma-specific error properties without using 'any'
      // @ts-expect-error - Bypassing TypeScript checks for Prisma error properties
      if (error.code) {
        // @ts-expect-error - Accessing Prisma error properties
        console.error('Error code:', error.code)
        // @ts-expect-error - Accessing Prisma error properties
        console.error('Error meta:', error.meta)
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update user role', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

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

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Don't allow admin to delete themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
