import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { initializeUserConnections, updateConnectionsForRoleChange } from '@/lib/connections/database'

export async function POST(request: NextRequest) {
  console.log('🚀 Role API: POST request received')
  const prisma = new PrismaClient()
  
  try {
    console.log('Role API: Starting role update request...')
    const session = await auth()
    console.log('Role API: Session:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      currentRole: session?.user?.role 
    })
    
    if (!session?.user?.id) {
      console.log('Role API: No session or user ID, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()
    console.log('Role API: Requested role:', role)

    if (!role || !['tasker', 'client', 'company'].includes(role)) {
      console.log('Role API: Invalid role provided:', role)
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 })
    }

    console.log('Role API: Updating user role in database...')
    // Update user role but keep profileSetupCompleted as false
    // Profile will be marked as completed after the profile setup form
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        role: role,
        // Don't set profileSetupCompleted here - will be set after profile setup
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileSetupCompleted: true,
        emailVerified: true,
        connections: true
      }
    })
    
    console.log('Role API: User updated successfully:', {
      id: updatedUser.id,
      role: updatedUser.role,
      profileSetupCompleted: updatedUser.profileSetupCompleted,
      connections: updatedUser.connections
    })

    // Check if this is initial role selection (user has no connections yet) or role change
    if (updatedUser.connections === 0 || updatedUser.connections === 10) {
      console.log('Role API: Initializing user connections...')
      // Initial role selection - initialize connections
      await initializeUserConnections(prisma, session.user.id, role)
    } else {
      console.log('Role API: Updating connections for role change...')
      // Role change - update connections based on new role
      await updateConnectionsForRoleChange(prisma, session.user.id, role)
    }

    console.log('Role API: Returning success response')
    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Role API: Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
