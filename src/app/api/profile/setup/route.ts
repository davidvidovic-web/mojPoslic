import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      username,
      phone,
      location,
      skills,
      skillExperiences,
      website,
    } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        username: username || undefined,
        skills: skills && Array.isArray(skills) ? skills.join(', ') : (skills || undefined),
        experience: skillExperiences && Array.isArray(skillExperiences) ? JSON.stringify(skillExperiences) : undefined,
        phone: phone || undefined,
        website: website || undefined,
        location: location || undefined,
        profileSetupCompleted: true,
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
        preferredJobTypes: updatedUser.preferredJobTypes ? updatedUser.preferredJobTypes.split(', ') : [],
        role: updatedUser.role,
        profileSetupCompleted: updatedUser.profileSetupCompleted,
        createdAt: updatedUser.createdAt,
      }
    })
  } catch (error) {
    console.error('Profile setup error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
