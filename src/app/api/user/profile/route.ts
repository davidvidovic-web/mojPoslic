import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
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

    // @ts-expect-error - Prisma types need regeneration after schema changes
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
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
        bio: updatedUser.bio,
        // @ts-expect-error - New fields not yet in type definitions
        phone: updatedUser.phone,
        // @ts-expect-error - New fields not yet in type definitions
        location: updatedUser.location,
        // @ts-expect-error - New fields not yet in type definitions
        website: updatedUser.website,
        // @ts-expect-error - New fields not yet in type definitions
        skills: updatedUser.skills,
        // @ts-expect-error - New fields not yet in type definitions
        experience: updatedUser.experience,
        // @ts-expect-error - New fields not yet in type definitions
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        // @ts-expect-error - New fields not yet in type definitions
        skills: true,
        // @ts-expect-error - New fields not yet in type definitions
        experience: true,
        // @ts-expect-error - New fields not yet in type definitions
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
