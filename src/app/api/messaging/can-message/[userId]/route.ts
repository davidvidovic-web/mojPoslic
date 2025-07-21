import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrivacyService } from '@/lib/messaging/privacy-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { userId } = params

    // Can't message yourself
    if (session.user.id === userId) {
      return NextResponse.json({ canMessage: false })
    }
    
    // Check if target user allows direct messages from current user
    const targetPrivacy = await PrivacyService.getUserPrivacySettings(userId)
    
    if (!targetPrivacy.allowDirectMessages) {
      return NextResponse.json({ canMessage: false })
    }

    // Additional checks based on profile visibility and relationships
    const isVisible = await PrivacyService.isProfileVisible(userId, session.user.id)
    if (!isVisible) {
      return NextResponse.json({ canMessage: false })
    }

    return NextResponse.json({ canMessage: true })
  } catch (error) {
    console.error('Error checking message permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
