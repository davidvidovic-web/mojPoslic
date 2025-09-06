import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    
    // Get auth header for token-based auth or use cookie-based auth
    const authHeader = request.headers.get('authorization')
    
    const supabase = authHeader 
      ? await (async () => {
          return createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get: () => undefined,
                set: () => {},
                remove: () => {},
              },
              global: {
                headers: {
                  'Authorization': authHeader
                }
              }
            }
          )
        })()
      : await createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user has access to this conversation by checking if they're the client or tasker
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        id,
        application_id,
        job_id,
        created_by_id
      `)
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      console.error('Conversation lookup error:', conversationError)
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    console.log('Conversation found:', { 
      id: conversation.id, 
      application_id: conversation.application_id, 
      job_id: conversation.job_id,
      created_by_id: conversation.created_by_id,
      current_user: user.id
    })

    // Check if user created the conversation (simple access check for now)
    if (conversation.created_by_id !== user.id) {
      // Check if user is involved through application or job
      let isApplicant = false
      let isJobPoster = false

      if (conversation.application_id) {
        const { data: application } = await supabase
          .from('applications')
          .select('user_id')
          .eq('id', conversation.application_id)
          .single()
        isApplicant = application?.user_id === user.id
      }
      
      if (conversation.job_id) {
        const { data: job } = await supabase
          .from('job_listings')
          .select('posted_by_id')
          .eq('id', conversation.job_id)
          .single()
        isJobPoster = job?.posted_by_id === user.id
      }

      if (!isApplicant && !isJobPoster) {
        console.log('Access denied:', { isApplicant, isJobPoster })
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        message_type,
        attachment_url,
        read_by,
        created_at,
        sender_id
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: messages || []
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    
    // Get auth header for token-based auth or use cookie-based auth
    const authHeader = request.headers.get('authorization')
    
    const supabase = authHeader 
      ? await (async () => {
          return createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get: () => undefined,
                set: () => {},
                remove: () => {},
              },
              global: {
                headers: {
                  'Authorization': authHeader
                }
              }
            }
          )
        })()
      : await createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { content, messageType = 'text', attachmentUrl } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this conversation by checking if they're the client or tasker
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        id,
        application_id,
        job_id,
        created_by_id
      `)
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      console.error('Conversation error in POST:', conversationError)
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    console.log('POST: Conversation found:', { 
      id: conversation.id, 
      application_id: conversation.application_id, 
      job_id: conversation.job_id,
      created_by_id: conversation.created_by_id,
      current_user: user.id
    })

    // Simplified access check - same as GET endpoint
    if (conversation.created_by_id !== user.id) {
      // Additional checks for applicant and job poster
      let isApplicant = false
      let isJobPoster = false

      if (conversation.application_id) {
        const { data: application } = await supabase
          .from('applications')
          .select('user_id')
          .eq('id', conversation.application_id)
          .single()
        isApplicant = application?.user_id === user.id
      }
      
      if (conversation.job_id) {
        const { data: job } = await supabase
          .from('job_listings')
          .select('posted_by_id')
          .eq('id', conversation.job_id)
          .single()
        isJobPoster = job?.posted_by_id === user.id
      }

      if (!isApplicant && !isJobPoster) {
        console.log('POST: Access denied:', { isApplicant, isJobPoster })
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Get user details for sender info
    const { data: userData } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single()

    // Send message
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_name: userData?.name || user.email || 'Unknown User',
        sender_avatar_url: userData?.avatar_url || null,
        content: content.trim(),
        message_type: messageType,
        attachment_url: attachmentUrl
      })
      .select(`
        id,
        content,
        message_type,
        attachment_url,
        read_by,
        created_at,
        sender_id
      `)
      .single()

    if (insertError) {
      console.error('Error sending message:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Create notification for message recipient(s)
    try {
      // Determine who should receive the notification (everyone in conversation except sender)
      let recipientIds: string[] = []
      
      if (conversation.application_id) {
        // Get application details to find both client and tasker
        const { data: application } = await supabase
          .from('applications')
          .select(`
            user_id,
            job:job_listings!applications_job_id_fkey(posted_by_id)
          `)
          .eq('id', conversation.application_id)
          .single()
          
        if (application) {
          // Add tasker (applicant) and client (job poster) to recipients
          if (application.user_id !== user.id) {
            recipientIds.push(application.user_id)
          }
          if (application.job?.posted_by_id && application.job.posted_by_id !== user.id) {
            recipientIds.push(application.job.posted_by_id)
          }
        }
      } else if (conversation.job_id) {
        // If it's a job-based conversation, notify the job poster
        const { data: job } = await supabase
          .from('job_listings')
          .select('posted_by_id')
          .eq('id', conversation.job_id)
          .single()
          
        if (job?.posted_by_id && job.posted_by_id !== user.id) {
          recipientIds.push(job.posted_by_id)
        }
      }

      // Create notifications for each recipient
      if (recipientIds.length > 0) {
        const senderName = userData?.name || user.email || 'Someone'
        const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content
        
        // Create service role client for notification creation (to bypass RLS)
        const supabaseService = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              get: () => undefined,
              set: () => {},
              remove: () => {},
            }
          }
        )

        const notifications = recipientIds.map(recipientId => ({
          user_id: recipientId,
          type: 'NEW_MESSAGE' as const,
          title: `New message from ${senderName}`,
          message: messagePreview,
          data: {
            conversation_id: conversationId,
            sender_id: user.id,
            sender_name: senderName,
            message_id: newMessage.id
          },
          is_read: false
        }))

        const { error: notificationError } = await supabaseService
          .from('notifications')
          .insert(notifications)

        if (notificationError) {
          console.error('Failed to create message notification:', notificationError)
          // Don't fail the message sending if notification creation fails
        }
      }
    } catch (notificationError) {
      console.error('Error creating message notification:', notificationError)
      // Don't fail the message sending if notification creation fails
    }

    return NextResponse.json({
      success: true,
      data: newMessage
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
