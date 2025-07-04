import { NextResponse } from 'next/server'
import { #getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { validateUsernameFormat } from '@/lib/username-validation'

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    const session = await #getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      name, 
      username,
      bio, 
      phone, 
      location, 
      website, 
      skills, 
      experience, 
      preferredJobTypes 
    } = await request.json()

    // Validate username if provided
    if (username && username !== session.user.username) {
      const formatValidation = validateUsernameFormat(username)
      if (!formatValidation.isValid) {
        return NextResponse.json({ 
          error: formatValidation.error 
        }, { status: 400 })
      }

      // Check if username is already taken
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })

      if (existingUser && existingUser.email !== session.user.email) {
        return NextResponse.json({ 
          error: 'Username is already taken' 
        }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        username,
        bio,
        phone,
        location,
        website,
        skills,
        experience,
        preferredJobTypes,
      },
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
        preferredJobTypes: updatedUser.preferredJobTypes,
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
    const session = await #getServerSession(authOptions)
    
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

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
