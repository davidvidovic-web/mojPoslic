import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { MessagingIntegrationService } from '@/lib/messaging/messaging-integration'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { jobId, otherUserId, jobTitle } = await request.json()

    if (!jobId || !otherUserId || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, otherUserId, jobTitle' },
        { status: 400 }
      )
    }

    // Create or get existing conversation
    const conversation = await MessagingIntegrationService.createJobConversationWithWelcome(
      jobId,
      session.user.id, // current user (client/job poster)
      otherUserId,     // other user (tasker/applicant)
      jobTitle
    )

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error creating job conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
