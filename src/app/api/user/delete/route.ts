import { NextResponse } from 'next/server'
import { #getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    const session = await #getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (prevent admin deletion via this endpoint)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ 
        error: 'Admin accounts cannot be deleted via this endpoint' 
      }, { status: 403 })
    }

    // Delete all related data in the correct order
    // 1. Delete applications
    await prisma.application.deleteMany({
      where: { userId: user.id }
    })

    // 2. Delete job listings posted by this user
    await prisma.jobListing.deleteMany({
      where: { postedById: user.id }
    })

    // 3. Delete sessions and accounts (NextAuth)
    await prisma.session.deleteMany({
      where: { userId: user.id }
    })

    await prisma.account.deleteMany({
      where: { userId: user.id }
    })

    // 4. Finally delete the user
    await prisma.user.delete({
      where: { id: user.id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete account' 
    }, { status: 500 })
  }
}
