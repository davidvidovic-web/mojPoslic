import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ConversationService } from '@/lib/messaging/conversation-service'
import { PrivacyService } from '@/lib/messaging/privacy-service'
import type { CreateConversationData } from '@/types/messaging'
import { z } from 'zod'

const createConversationSchema = z.object({
  type: z.enum(['direct', 'group', 'job_related']),
  title: z.string().optional(),
  participants: z.array(z.string()).min(1),
  isPrivate: z.boolean().optional().default(true),
  jobId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createConversationSchema.parse(body)

    const conversationData: CreateConversationData = {
      type: validatedData.type,
      title: validatedData.title,
      participant_ids: validatedData.participants,
      job_id: validatedData.jobId
    }

    // For direct conversations, check privacy and create safely
    if (validatedData.type === 'direct' && validatedData.participants.length === 1) {
      const otherUserId = validatedData.participants[0]
      
      const conversation = await PrivacyService.createConversationWithPrivacyCheck(
        session.user.id,
        otherUserId,
        validatedData.jobId ? 'job_related' : 'direct',
        validatedData.jobId
      )

      return NextResponse.json({
        success: true,
        conversation
      })
    }

    // For group conversations, create normally
    const conversation = await ConversationService.createConversation(
      conversationData,
      session.user.id
    )

    return NextResponse.json({
      success: true,
      conversation
    })

  } catch (error) {
    console.error('Error creating conversation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
