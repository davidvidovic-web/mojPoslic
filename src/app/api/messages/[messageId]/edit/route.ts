import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'
import { z } from 'zod'

const editMessageSchema = z.object({
  content: z.string().min(1).max(5000)
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { messageId } = await params
    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { content } = editMessageSchema.parse(body)

    const supabase = createSupabaseAdmin()

    // Check if user owns the message
    const { data: existingMessage, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id, conversation_id')
      .eq('id', messageId)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    if (existingMessage.sender_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      )
    }

    // Update the message
    const { data: editedMessage, error: updateError } = await supabase
      .from('messages')
      .update({ 
        content,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select(`
        *,
        sender:sender_id (
          id,
          name,
          role
        )
      `)
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: {
        id: editedMessage.id,
        conversationId: editedMessage.conversation_id,
        senderId: editedMessage.sender_id,
        content: editedMessage.content,
        messageType: editedMessage.message_type,
        attachmentUrl: editedMessage.attachment_url,
        attachmentFilename: editedMessage.attachment_filename,
        attachmentSize: editedMessage.attachment_size,
        replyToMessageId: editedMessage.reply_to_message_id,
        editedAt: editedMessage.edited_at,
        deletedAt: editedMessage.deleted_at,
        createdAt: editedMessage.created_at,
        sender: editedMessage.sender ? {
          id: editedMessage.sender.id,
          name: editedMessage.sender.name,
          avatarUrl: undefined,
          role: editedMessage.sender.role
        } : undefined
      }
    })

  } catch (error) {
    console.error('Error editing message:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to edit message' },
      { status: 500 }
    )
  }
}
