import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: conversationId } = await params
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()

    // Check if user is a participant in the conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', session.user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      )
    }

    // Archive the conversation for this user (soft delete participation)
    const { error: archiveError } = await supabase
      .from('conversation_participants')
      .update({ 
        archived_at: new Date().toISOString(),
        left_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', session.user.id)

    if (archiveError) {
      throw archiveError
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation archived successfully'
    })

  } catch (error) {
    console.error('Error archiving conversation:', error)

    return NextResponse.json(
      { error: 'Failed to archive conversation' },
      { status: 500 }
    )
  }
}