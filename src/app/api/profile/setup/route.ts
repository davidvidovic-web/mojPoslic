import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      username,
      bio,
      skills,
      experience,
      preferredJobTypes,
      phone,
      website,
      location,
      companyName,
      position,
    } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        username: username || undefined,
        bio: bio || undefined,
        skills: skills || undefined,
        experience: experience || undefined,
        preferredJobTypes: preferredJobTypes || '',
        phone: phone || undefined,
        website: website || undefined,
        location: location || undefined,
        companyName: companyName || undefined,
        position: position || undefined,
        profileSetupCompleted: true,
      },
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileSetupCompleted: updatedUser.profileSetupCompleted,
      }
    })
  } catch (error) {
    console.error('Profile setup error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
