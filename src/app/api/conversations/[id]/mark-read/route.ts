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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const userId = session.user.id
    const supabase = createSupabaseAdmin()

    // Verify user has access to this conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Update the participant's last_read_at timestamp
    const { error: updateError } = await supabase
      .from('conversation_participants')
      .update({ 
        last_read_at: new Date().toISOString() 
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating last read timestamp:', updateError)
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in mark-read API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
