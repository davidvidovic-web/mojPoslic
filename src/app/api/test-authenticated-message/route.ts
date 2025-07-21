import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
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

    const { conversationId, content } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing conversationId or content' 
      }, { status: 400 })
    }

    console.log('Sending message with authenticated client...')
    console.log('User ID:', session.user.id)
    console.log('User Role:', session.user.role)

    // Create authenticated Supabase client with user context
    const supabase = createServerSupabaseClient(session.user.id)

    // Try to send a message using the authenticated client
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        content: content,
        message_type: 'text'
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        message_type,
        attachment_url,
        attachment_type,
        attachment_size,
        reply_to_message_id,
        edited_at,
        deleted_at,
        created_at
      `)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    // Also add message status
    const { error: statusError } = await supabase
      .from('message_status')
      .insert({
        message_id: message.id,
        user_id: session.user.id,
        status: 'sent',
        timestamp: new Date().toISOString()
      })

    if (statusError) {
      console.error('Message status error:', statusError)
      // Don't fail the whole operation for status error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      data: message,
      userContext: {
        userId: session.user.id,
        userRole: session.user.role
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
