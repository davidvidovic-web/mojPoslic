import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { confirmationText, reason } = body

    // Get user with name
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        name: true, 
        email: true,
        role: true
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin deletion
    if (user.role === 'admin') {
      return NextResponse.json({ 
        error: 'Admin accounts cannot be deleted' 
      }, { status: 403 })
    }

    // Check if user already has a deletion request
    const existingRequest = await prisma.accountDeletionRequest.findUnique({
      where: { userId: user.id }
    })

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'Account is already scheduled for deletion',
        scheduledDeletion: existingRequest.scheduledDeletion
      }, { status: 400 })
    }

    // Validate confirmation text
    if (!user.name) {
      return NextResponse.json({ 
        error: 'Name is required for account deletion' 
      }, { status: 400 })
    }

    if (confirmationText !== user.name) {
      return NextResponse.json({ 
        error: 'Name confirmation does not match' 
      }, { status: 400 })
    }

    // Calculate deletion date (90 days from now)
    const scheduledDeletion = new Date()
    scheduledDeletion.setDate(scheduledDeletion.getDate() + 90)

    // Get request metadata
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create deletion request
    const deletionRequest = await prisma.accountDeletionRequest.create({
      data: {
        userId: user.id,
        scheduledDeletion,
        reason: reason || null,
        confirmationText,
        ipAddress,
        userAgent,
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Account deletion scheduled successfully',
      scheduledDeletion: deletionRequest.scheduledDeletion
    })
  } catch (error) {
    console.error('Account deletion request error:', error)
    return NextResponse.json({ 
      error: 'Failed to schedule account deletion' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        deletionRequest: true
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.deletionRequest) {
      return NextResponse.json({ 
        error: 'No deletion request found' 
      }, { status: 404 })
    }

    // Cancel the deletion request
    await prisma.accountDeletionRequest.delete({
      where: { userId: user.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Deletion request cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel deletion request error:', error)
    return NextResponse.json({ 
      error: 'Failed to cancel deletion request' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
