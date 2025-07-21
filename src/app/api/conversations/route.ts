import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSupabaseAdmin } from '@/lib/supabase-nextauth-integration'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get the authenticated session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const supabase = createSupabaseAdmin()

    console.log('Fetching conversations for user:', userId)

    // Step 1: Get conversations where user is a participant from Supabase
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId)

    if (participantError) {
      console.error('Error fetching conversation participants:', participantError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    if (!participantData || participantData.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const conversationIds = participantData.map(p => p.conversation_id)

    // Step 2: Get conversation details from Supabase
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch conversation details' },
        { status: 500 }
      )
    }

    // Step 3: Get all participants for these conversations
    const { data: allParticipants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('*')
      .in('conversation_id', conversationIds)

    if (participantsError) {
      console.error('Error fetching all participants:', participantsError)
    }

    // Step 4: Get user data from Prisma for all participants
    const allUserIds = Array.from(new Set(allParticipants?.map(p => p.user_id) || []))
    const users = await prisma.user.findMany({
      where: { id: { in: allUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true
      }
    })

    const usersMap = users.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {} as Record<string, typeof users[0]>)

    // Step 5: Get job data from Prisma for job-related conversations
    const jobIds = conversations?.filter(conv => conv.job_id).map(conv => conv.job_id) || []
    let jobsMap: Record<string, { id: string; title: string; company: string }> = {}

    if (jobIds.length > 0) {
      const jobs = await prisma.jobListing.findMany({
        where: { id: { in: jobIds } },
        select: {
          id: true,
          title: true,
          company: true
        }
      })

      jobsMap = jobs.reduce((acc, job) => {
        acc[job.id] = job
        return acc
      }, {} as Record<string, { id: string; title: string; company: string }>)
    }

    // Step 6: Get last messages for each conversation
    const { data: lastMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })

    if (messagesError) {
      console.error('Error fetching last messages:', messagesError)
    }

    // Group last messages by conversation
    const lastMessagesByConversation: Record<string, {
      id: string;
      conversation_id: string;
      sender_id: string;
      content: string;
      message_type: string;
      created_at: string;
    }> = {}
    if (lastMessages) {
      for (const message of lastMessages) {
        if (!lastMessagesByConversation[message.conversation_id]) {
          lastMessagesByConversation[message.conversation_id] = message
        }
      }
    }

    // Step 7: Format the response with all data combined
    const formattedConversations = conversations?.map(conversation => {
      const conversationParticipants = allParticipants?.filter(
        p => p.conversation_id === conversation.id
      ) || []

      const lastMessage = lastMessagesByConversation[conversation.id]
      const jobInfo = conversation.job_id ? jobsMap[conversation.job_id] : null

      // Generate proper title if not set
      let conversationTitle = conversation.title
      if (!conversationTitle) {
        if (conversation.type === 'job_related' && jobInfo) {
          conversationTitle = `${jobInfo.title} - ${jobInfo.company}`
        } else if (conversation.type === 'direct') {
          // For direct conversations, use the other participant's name
          const otherParticipant = conversationParticipants.find(p => p.user_id !== userId)
          if (otherParticipant) {
            const otherUser = usersMap[otherParticipant.user_id]
            conversationTitle = otherUser?.name || otherUser?.email || 'Unknown User'
          }
        } else if (conversation.type === 'group') {
          conversationTitle = 'Group Chat'
        }
      }

      return {
        id: conversation.id,
        type: conversation.type,
        title: conversationTitle,
        job_id: conversation.job_id,
        jobTitle: jobInfo?.title,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        last_message_at: conversation.last_message_at,
        archived: conversation.archived,
        participants: conversationParticipants.map(p => {
          const user = usersMap[p.user_id]
          return {
            id: p.user_id,
            conversation_id: p.conversation_id,
            user_id: p.user_id,
            joined_at: p.joined_at,
            left_at: p.left_at,
            role: p.role,
            last_read_at: p.last_read_at,
            user: user ? {
              id: user.id,
              email: user.email,
              name: user.name || user.email,
              avatar_url: user.avatarUrl,
              role: user.role
            } : null
          }
        }),
        last_message: lastMessage ? {
          id: lastMessage.id,
          conversationId: lastMessage.conversation_id,
          senderId: lastMessage.sender_id,
          content: lastMessage.content,
          messageType: lastMessage.message_type,
          createdAt: lastMessage.created_at,
          sender: usersMap[lastMessage.sender_id] ? {
            id: usersMap[lastMessage.sender_id].id,
            name: usersMap[lastMessage.sender_id].name || usersMap[lastMessage.sender_id].email,
            avatarUrl: usersMap[lastMessage.sender_id].avatarUrl
          } : null
        } : undefined,
        unread_count: 0 // TODO: Calculate based on last_read_at vs messages
      }
    }) || []

    console.log(`Found ${formattedConversations.length} conversations for user ${userId}`)

    return NextResponse.json({
      success: true,
      data: formattedConversations
    })

  } catch (error) {
    console.error('Error in conversations API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
