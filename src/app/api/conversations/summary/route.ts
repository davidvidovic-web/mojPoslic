import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'

export async function GET() {
  try {
    // Get the authenticated session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const supabase = createSupabaseAdmin()

    // Get conversation IDs where user is a participant
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId)

    if (participantError) {
      console.error('Error fetching conversation participants:', participantError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    if (!participantData || participantData.length === 0) {
      return NextResponse.json({
        conversations: [],
        totalUnreadCount: 0
      })
    }

    const conversationIds = participantData.map(p => p.conversation_id)

    // Get conversations with minimal data for efficient loading
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        title,
        job_id,
        created_at,
        updated_at,
        last_message_at,
        archived
      `)
      .in('id', conversationIds)
      .eq('archived', false)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Get participant info for each conversation efficiently
    const { data: allParticipants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        user_id,
        last_read_at,
        users!inner (
          id,
          name,
          avatar_url
        )
      `)
      .in('conversation_id', conversationIds)

    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
    }

    // Calculate total unread count (simplified - could be optimized with SQL function)
    const totalUnreadCount = 0 // TODO: Implement proper unread count calculation
    
    // Transform conversations for efficient client use
    const transformedConversations = conversations?.map(conv => {
      const convParticipants = allParticipants?.filter(p => p.conversation_id === conv.id) || []
      const otherParticipants = convParticipants.filter(p => p.user_id !== userId)
      
      // Get the first other participant's name for direct conversations
      const firstOtherParticipant = otherParticipants[0]
      const otherParticipantName = firstOtherParticipant?.users && 
        typeof firstOtherParticipant.users === 'object' && 
        'name' in firstOtherParticipant.users 
          ? String(firstOtherParticipant.users.name)
          : 'Unknown User'

      return {
        id: conv.id,
        type: conv.type,
        title: conv.title || 
          (conv.type === 'direct' && otherParticipants.length > 0
            ? otherParticipantName
            : 'Group Chat'),
        job_id: conv.job_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        last_message_at: conv.last_message_at,
        archived: conv.archived,
        participants: convParticipants,
        unread_count: 0, // Will be calculated separately if needed
        last_message: undefined // Not included in summary for performance
      }
    }) || []

    return NextResponse.json({
      conversations: transformedConversations,
      totalUnreadCount
    })

  } catch (error) {
    console.error('Error in conversations summary API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
