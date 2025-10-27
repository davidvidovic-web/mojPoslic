import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Create a conversation between client and tasker for a job application
export async function POST(request: NextRequest) {
  try {
    // Get auth header for token-based auth or use cookie-based auth
    const authHeader = request.headers.get('authorization')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = authHeader 
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
    const { applicationId, jobId, taskerId, clientId } = body

    if (!applicationId || !jobId || !taskerId || !clientId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is either the client or tasker
    if (user.id !== clientId && user.id !== taskerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to create this conversation' },
        { status: 403 }
      )
    }

    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('application_id', applicationId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing conversation:', checkError)
      return NextResponse.json(
        { success: false, error: 'Failed to check existing conversation' },
        { status: 500 }
      )
    }

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        data: { conversationId: existingConversation.id, existed: true }
      })
    }

    // Get job title for conversation
    const { data: job } = await supabase
      .from('job_listings')
      .select('title')
      .eq('id', jobId)
      .single()

    // Get both client and tasker names and avatars from users table
    const { data: clientUser } = await supabase
      .from('users')
      .select('full_name, username, avatar_url')
      .eq('id', clientId)
      .single()

    const { data: taskerUser } = await supabase
      .from('users')
      .select('full_name, username, avatar_url')
      .eq('id', taskerId)
      .single()

    const clientName = clientUser?.full_name || clientUser?.username || 'Client'
    const taskerName = taskerUser?.full_name || taskerUser?.username || 'Tasker'
    const clientAvatar = clientUser?.avatar_url || null
    const taskerAvatar = taskerUser?.avatar_url || null

    // Create new conversation
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        application_id: applicationId,
        job_id: jobId,
        created_by_id: user.id,
        title: `${taskerName} - ${job?.title || 'Job'}`,
        is_active: true,
        participant_ids: [clientId, taskerId],
        participant_names: [clientName, taskerName],
        participant_avatars: [clientAvatar, taskerAvatar]
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating conversation:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { conversationId: newConversation.id, existed: false }
    })

  } catch (error) {
    console.error('Conversation creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
