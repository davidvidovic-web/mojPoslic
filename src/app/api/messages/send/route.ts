import { NextResponse } from 'next/server'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-server'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, content } = body

    if (!conversationId || !content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing conversationId or content' 
      }, { status: 400 })
    }

    // Use authenticated Supabase client
    const client = await createAuthenticatedSupabaseClient()

    // Send message
    const { data: message, error } = await client
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        content: content
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at
      `)
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code
      }, { status: 500 })
    }

    // Transform message to expected format
    const transformedMessage = {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      // Default values for fields that don't exist yet in database
      updatedAt: message.created_at,
      messageType: 'text',
      attachmentUrl: null,
      attachmentType: null,
      attachmentSize: null,
      replyToMessageId: null,
      editedAt: null,
      deletedAt: null,
      isRead: false,
      sender: {
        id: session.user.id,
        name: session.user.name || 'User',
        avatarUrl: session.user.image,
        role: session.user.role || 'user'
      },
      status: 'sent'
    }

    return NextResponse.json({ 
      success: true, 
      data: transformedMessage
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
