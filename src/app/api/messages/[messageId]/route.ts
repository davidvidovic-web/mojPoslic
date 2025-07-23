import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'
import { PrismaClient } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const prisma = new PrismaClient()
  
  try {
    // Get the current session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = await params
    const supabase = createSupabaseAdmin()

    // Step 1: Get the message from Supabase
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (messageError) {
      console.error('Error fetching message:', messageError)
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Step 2: Check if user has access to this conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', session.user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Step 3: Get sender info from Prisma
    const sender = await prisma.user.findUnique({
      where: { id: message.sender_id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true
      }
    })

    // Step 4: Format the response
    const formattedMessage = {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      content: message.content,
      messageType: message.message_type,
      attachmentUrl: message.attachment_url,
      attachmentFilename: message.attachment_filename,
      attachmentSize: message.attachment_size,
      replyToMessageId: message.reply_to_message_id,
      editedAt: message.edited_at,
      deletedAt: message.deleted_at,
      createdAt: message.created_at,
      sender: sender ? {
        id: sender.id,
        name: sender.name || sender.email,
        avatarUrl: sender.avatarUrl,
        role: sender.role
      } : null
    }

    return NextResponse.json({ message: formattedMessage })

  } catch (error) {
    console.error('Error in GET /api/messages/[messageId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
