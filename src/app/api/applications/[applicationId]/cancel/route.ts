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
    
    console.log('🚫 Cancel API - Auth check:', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    })
    
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
    
    console.log('🚫 Cancel API - User check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('🚫 User attempting to cancel application:', {
      userId: user.id,
      applicationId: applicationId
    })

    // First, verify the application exists and belongs to the user
    console.log('🔍 Checking if application exists and belongs to user:', {
      applicationId,
      userId: user.id
    })
    
    const { data: existingApplication, error: fetchError } = await supabaseAuth
      .from('applications')
      .select('id, user_id, job_id, status')
      .eq('id', applicationId)
      .single()

    console.log('🔍 Application fetch result:', {
      existingApplication,
      fetchError,
      userOwnsApplication: existingApplication?.user_id === user.id
    })

    if (fetchError) {
      console.error('❌ Failed to fetch application:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    if (!existingApplication || existingApplication.user_id !== user.id) {
      console.error('❌ Application not found or user does not own it:', {
        applicationId,
        userId: user.id,
        applicationUserId: existingApplication?.user_id
      })
      return NextResponse.json(
        { success: false, error: 'Application not found or access denied' },
        { status: 403 }
      )
    }

    console.log('✅ Application ownership verified, proceeding with deletion...')

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

    console.log('🔍 Using service role client for deletion to bypass any RLS issues')

    // Double-check that we have all the necessary data before deletion
    console.log('🔍 Pre-deletion verification:', {
      applicationId,
      userId: user.id,
      applicationExists: !!existingApplication,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })

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
      console.error('❌ User does not own this application:', {
        applicationUserId: application.user_id,
        currentUserId: user.id
      })
      return NextResponse.json(
        { success: false, error: 'Unauthorized to cancel this application' },
        { status: 403 }
      )
    }

    // Check if application can be cancelled (only pending applications)
    // Handle both uppercase and lowercase status values due to database inconsistencies
    const status = application.status?.toLowerCase()
    if (status !== 'pending') {
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

    console.log('✅ Application can be cancelled - no messaging started')

    // Comprehensive cleanup - Remove ALL data tied to this application
    // We need to clean up in the correct order due to foreign key constraints
    
    // 1. First, check for and delete any conversations and messages related to this application
    console.log('🧹 Cleaning up conversations and messages for application:', applicationId)
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
      console.log('🧹 Found conversation to delete:', conversationToDelete.id)
      
      // Delete messages first (foreign key constraint)
      if (conversationToDelete.messages && conversationToDelete.messages.length > 0) {
        console.log('🧹 Deleting messages:', conversationToDelete.messages.length)
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
    console.log('🧹 Cleaning up notifications for application:', applicationId)
    const { error: notificationDeleteError } = await supabaseService
      .from('notifications')
      .delete()
      .or(`data->>application_id.eq."${applicationId}"`)

    if (notificationDeleteError) {
      console.error('❌ Failed to delete notifications:', notificationDeleteError)
      // Continue anyway - we'll still try to delete the application
    }

    // 3. Delete any file uploads related to this application (cover letters, etc.)
    console.log('🧹 Cleaning up file uploads for application:', applicationId)
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
    console.log('🧹 Deleting the application record:', applicationId)
    const { data: deletedData, error: deleteError, count } = await supabaseService
      .from('applications')
      .delete()
      .eq('id', applicationId)
      .select() // This will return the deleted record to confirm deletion

    console.log('🔍 Delete operation result:', {
      deletedData,
      deleteError,
      count,
      applicationId
    })

    if (deleteError) {
      console.error('❌ Failed to delete application:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to cancel application', details: deleteError },
        { status: 500 }
      )
    }

    // Update job application count after successful deletion
    if (deletedData && deletedData.length > 0 && application.job_id) {
      console.log('🔢 Updating job application count after deletion')
      
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
          console.log('✅ Job application count decremented successfully')
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

    console.log('✅ Application and all related data deleted successfully:', {
      applicationId: applicationId,
      deletedAt: new Date().toISOString(),
      cleanedUp: {
        conversation: !!conversationToDelete,
        messages: conversationToDelete?.messages?.length || 0,
        notifications: 'deleted',
        fileUploads: 'deleted'
      }
    })

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
