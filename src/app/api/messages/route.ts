import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor')

    if (!conversationId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing conversationId' 
      }, { status: 400 })
    }

    // Use authenticated Supabase client
    const client = await createAuthenticatedSupabaseClient()
    
    let query = client
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (cursor) {
      // Validate cursor is a valid timestamp
      const cursorDate = new Date(cursor)
      if (isNaN(cursorDate.getTime())) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid cursor format' 
        }, { status: 400 })
      }
      query = query.lt('created_at', cursor)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    // Transform messages to include sender info (simplified for now)
    const messages = (data || []).map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      // Default values for fields that don't exist yet in database
      updatedAt: msg.created_at, // Use created_at as fallback
      isRead: false,
      messageType: 'text',
      attachmentUrl: null,
      attachmentType: null,
      attachmentSize: null,
      replyToMessageId: null,
      editedAt: null,
      deletedAt: null,
      sender: {
        id: msg.sender_id,
        name: 'User', // Would need to fetch from users table
        avatarUrl: null,
        role: 'user'
      },
      status: 'sent' // Default status
    }))

    return NextResponse.json({ 
      success: true, 
      data: messages.reverse() // Return in chronological order
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, content, messageType = 'text' } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Step 1: Check if user has access to this conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', session.user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Step 2: Insert the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        content,
        message_type: messageType,
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error inserting message:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Step 3: Update conversation last_message_at
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (updateError) {
      console.warn('Error updating conversation timestamp:', updateError)
    }

    return NextResponse.json({ 
      message: {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        messageType: message.message_type,
        createdAt: message.created_at,
        sender: {
          id: session.user.id,
          name: session.user.name || session.user.email || 'Unknown',
          avatarUrl: session.user.image || undefined,
          role: (session.user as { role?: string }).role || 'user'
        }
      }
    })

  } catch (error) {
    console.error('Error in POST /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
