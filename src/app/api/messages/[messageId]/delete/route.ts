import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'

export async function DELETE(
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
        { error: 'You can only delete your own messages' },
        { status: 403 }
      )
    }

    // Soft delete the message by setting deleted_at and clearing content
    const { data: deletedMessage, error: updateError } = await supabase
      .from('messages')
      .update({ 
        content: null,
        deleted_at: new Date().toISOString()
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
        id: deletedMessage.id,
        conversationId: deletedMessage.conversation_id,
        senderId: deletedMessage.sender_id,
        content: deletedMessage.content,
        messageType: deletedMessage.message_type,
        attachmentUrl: deletedMessage.attachment_url,
        attachmentFilename: deletedMessage.attachment_filename,
        attachmentSize: deletedMessage.attachment_size,
        replyToMessageId: deletedMessage.reply_to_message_id,
        editedAt: deletedMessage.edited_at,
        deletedAt: deletedMessage.deleted_at,
        createdAt: deletedMessage.created_at,
        sender: deletedMessage.sender ? {
          id: deletedMessage.sender.id,
          name: deletedMessage.sender.name,
          avatarUrl: undefined,
          role: deletedMessage.sender.role
        } : undefined
      }
    })

  } catch (error) {
    console.error('Error deleting message:', error)

    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
