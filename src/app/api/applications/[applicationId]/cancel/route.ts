import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Database } from '@/lib/database.types'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params

    // Get auth header for token-based auth or use cookie-based auth
    const authHeader = request.headers.get('authorization')
    
    // Create supabase client with proper auth handling
    const supabaseAuth = authHeader 
      ? createServerClient<Database>(
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
      : await createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // First, verify the application exists and belongs to the user
    const { data: existingApplication, error: fetchError } = await supabaseAuth
      .from('applications')
      .select('id, user_id, job_id, status')
      .eq('id', applicationId)
      .single()

    if (fetchError) {
      console.error('❌ Failed to fetch application:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    if (!existingApplication || existingApplication.user_id !== user.id) {
      console.error('❌ Application not found or user does not own it')
      return NextResponse.json(
        { success: false, error: 'Application not found or access denied' },
        { status: 403 }
      )
    }

    // Create a service role client to bypass RLS for debugging
    const supabaseService = createServerClient<Database>(
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

    // Get the application to verify ownership and current status
    const { data: application, error: appError } = await supabaseAuth
      .from('applications')
      .select(`
        id,
        status,
        user_id,
        job_id,
        applied_at
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      console.error('❌ Failed to fetch application:', appError)
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify user owns this application
    if (application.user_id !== user.id) {
      console.error('❌ User does not own this application')
      return NextResponse.json(
        { success: false, error: 'Unauthorized to cancel this application' },
        { status: 403 }
      )
    }

    // Check if application can be cancelled (only pending applications)
    if (application.status !== 'PENDING') {
      console.error('❌ Application cannot be cancelled - invalid status:', application.status)
      return NextResponse.json(
        { success: false, error: 'Application cannot be cancelled at this stage' },
        { status: 400 }
      )
    }

    // Check if a conversation/messaging has started for this application
    const { data: existingConversation, error: convError } = await supabaseAuth
      .from('conversations')
      .select(`
        id,
        application_id,
        created_at,
        messages (
          id,
          created_at
        )
      `)
      .eq('application_id', applicationId)
      .single()

    if (convError && convError.code !== 'PGRST116') {
      console.error('❌ Error checking conversations:', convError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify messaging status' },
        { status: 500 }
      )
    }

    // If conversation exists and has messages, prevent cancellation
    if (existingConversation && existingConversation.messages && existingConversation.messages.length > 0) {
      console.error('❌ Cannot cancel - messaging has started:', {
        conversationId: existingConversation.id,
        messageCount: existingConversation.messages.length
      })
      return NextResponse.json(
        { success: false, error: 'Cannot cancel application - messaging has already started with the client' },
        { status: 400 }
      )
    }


    // Comprehensive cleanup - Remove ALL data tied to this application
    // We need to clean up in the correct order due to foreign key constraints
    
    // 1. First, check for and delete any conversations and messages related to this application
    const { data: conversationToDelete, error: conversationFetchError } = await supabaseService
      .from('conversations')
      .select(`
        id,
        messages (
          id
        )
      `)
      .eq('application_id', applicationId)
      .single()

    if (conversationFetchError && conversationFetchError.code !== 'PGRST116') {
      console.error('❌ Failed to fetch conversation:', conversationFetchError)
      // Continue anyway - the conversation might not exist
    }

    if (conversationToDelete) {
      
      // Delete messages first (foreign key constraint)
      if (conversationToDelete.messages && conversationToDelete.messages.length > 0) {
        const { error: messagesError } = await supabaseService
          .from('messages')
          .delete()
          .eq('conversation_id', conversationToDelete.id)

        if (messagesError) {
          console.error('❌ Failed to delete messages:', messagesError)
          // Continue anyway - we'll still try to delete the conversation and application
        }
      }

      // Delete the conversation
      const { error: conversationError } = await supabaseService
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete.id)

      if (conversationError) {
        console.error('❌ Failed to delete conversation:', conversationError)
        // Continue anyway - we'll still try to delete the application
      }
    }

    // 2. Delete any notifications related to this application
    const { error: notificationDeleteError } = await supabaseService
      .from('notifications')
      .delete()
      .or(`data->>application_id.eq."${applicationId}"`)

    if (notificationDeleteError) {
      console.error('❌ Failed to delete notifications:', notificationDeleteError)
      // Continue anyway - we'll still try to delete the application
    }

    // 3. Delete any file uploads related to this application (cover letters, etc.)
    const { error: fileDeleteError } = await supabaseService
      .from('file_uploads')
      .delete()
      .eq('related_table', 'applications')
      .eq('related_id', applicationId)

    if (fileDeleteError) {
      console.error('❌ Failed to delete file uploads:', fileDeleteError)
      // Continue anyway - we'll still try to delete the application
    }

    // 4. Finally, delete the application itself using service role for debugging
    const { data: deletedData, error: deleteError } = await supabaseService
      .from('applications')
      .delete()
      .eq('id', applicationId)
      .select() // This will return the deleted record to confirm deletion

    if (deleteError) {
      console.error('❌ Failed to delete application:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to cancel application', details: deleteError },
        { status: 500 }
      )
    }

    // Update job application count after successful deletion
    if (deletedData && deletedData.length > 0 && application.job_id) {
      
      const { data: jobData, error: jobFetchError } = await supabaseService
        .from('job_listings')
        .select('application_count')
        .eq('id', application.job_id)
        .single()
      
      if (jobFetchError) {
        console.error('❌ Failed to fetch job data for count update:', jobFetchError)
      } else {
        const newCount = Math.max(0, (jobData.application_count || 0) - 1)
        
        const { error: updateError } = await supabaseService
          .from('job_listings')
          .update({ 
            application_count: newCount 
          })
          .eq('id', application.job_id)
        
        if (updateError) {
          console.error('❌ Failed to update job application count:', updateError)
        } else {
        }
      }
    }

    if (!deletedData || deletedData.length === 0) {
      console.error('❌ No application was deleted. Application may not exist or user lacks permission.')
      return NextResponse.json(
        { success: false, error: 'Application not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully with all related data',
      cleanup: {
        conversation_deleted: !!conversationToDelete,
        messages_deleted: conversationToDelete?.messages?.length || 0,
        notifications_deleted: 'completed',
        file_uploads_deleted: 'completed',
        application_deleted: 1
      },
      cache_invalidation_hint: {
        invalidate_patterns: [
          ['applications'],
          ['client-applications'],
          ['jobs', 'applications'],
          ['applications', 'user', '*'],
          ['notifications']
        ]
      }
    })

  } catch (error) {
    console.error('❌ Application cancellation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
