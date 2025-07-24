import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'

export async function GET(
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

    // Get pagination parameters
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor') // Message ID to start from
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

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

    // Build query for messages with pagination
    let query = supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        message_type,
        attachment_url,
        attachment_filename,
        attachment_size,
        reply_to_message_id,
        edited_at,
        deleted_at,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Add cursor-based pagination
    if (cursor) {
      // Get the timestamp of the cursor message for proper pagination
      const { data: cursorMessage } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', cursor)
        .single()

      if (cursorMessage) {
        query = query.lt('created_at', cursorMessage.created_at)
      }
    }

    const { data: messages, error: messagesError } = await query

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Transform messages to match expected format
    const transformedMessages = messages?.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      messageType: msg.message_type,
      attachmentUrl: msg.attachment_url,
      attachmentFilename: msg.attachment_filename,
      attachmentSize: msg.attachment_size,
      replyToMessageId: msg.reply_to_message_id,
      editedAt: msg.edited_at,
      deletedAt: msg.deleted_at,
      createdAt: msg.created_at,
      // Note: sender info would need to be fetched separately from your User model
      sender: null
    })) || []

    // Determine if there are more messages
    const hasMore = transformedMessages.length === limit

    // Get next cursor (oldest message ID in current batch)
    const nextCursor = hasMore && transformedMessages.length > 0 
      ? transformedMessages[transformedMessages.length - 1].id 
      : null

    return NextResponse.json({
      messages: transformedMessages.reverse(), // Return in chronological order
      pagination: {
        hasMore,
        nextCursor,
        limit
      }
    })

  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
