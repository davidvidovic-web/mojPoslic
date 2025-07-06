import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      name, 
      bio, 
      phone, 
      location, 
      website, 
      skills, 
      experience, 
      preferredJobTypes 
    } = await request.json()

    // Get current user to check role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Base update data that all roles can modify
    const baseUpdateData = {
      name,
      phone,
      location,
      website,
    }

    // Only include professional fields for non-client roles
    const updateData = currentUser.role === 'client' 
      ? baseUpdateData 
      : {
          ...baseUpdateData,
          bio,
          skills,
          experience,
          preferredJobTypes: Array.isArray(preferredJobTypes) 
            ? preferredJobTypes.join(', ') 
            : preferredJobTypes || '',
        }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        location: updatedUser.location,
        website: updatedUser.website,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        preferredJobTypes: updatedUser.preferredJobTypes ? updatedUser.preferredJobTypes.split(', ') : [],
        role: updatedUser.role,
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        skills: true,
        experience: true,
        preferredJobTypes: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert preferredJobTypes string back to array for frontend consumption
    const userWithArrayJobTypes = {
      ...user,
      preferredJobTypes: user.preferredJobTypes ? user.preferredJobTypes.split(', ') : []
    }

    return NextResponse.json({ user: userWithArrayJobTypes })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
