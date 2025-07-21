import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Create admin Supabase client that bypasses RLS
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Try service role key first, fallback to anon key with warning
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Using anon key instead of service role key - RLS may cause issues')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, otherUserId, jobTitle } = body

    if (!jobId || !otherUserId || !jobTitle) {
      return NextResponse.json({ 
        error: 'Missing required fields: jobId, otherUserId, jobTitle' 
      }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Check if job conversation already exists
    const { data: existing, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('type', 'job_related')
      .eq('job_id', jobId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // Not "no rows returned"
      console.error('Error checking existing conversation:', checkError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existing) {
      // Return existing conversation
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          id,
          type,
          title,
          job_id,
          created_at,
          updated_at,
          last_message_at,
          archived,
          conversation_participants (
            id,
            user_id,
            role,
            last_read_at,
            joined_at,
            left_at
          )
        `)
        .eq('id', existing.id)
        .single()

      if (fetchError) {
        console.error('Error fetching existing conversation:', fetchError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        conversation,
        isNew: false
      })
    }

    // Create new job conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: 'job_related',
        title: `Prijava za posao: ${jobTitle}`,
        job_id: jobId
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    // Add participants
    const participants = [
      { conversation_id: conversation.id, user_id: session.user.id, role: 'admin' },
      { conversation_id: conversation.id, user_id: otherUserId, role: 'member' }
    ]

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    if (participantsError) {
      console.error('Error adding participants:', participantsError)
      // Try to clean up the conversation
      await supabase.from('conversations').delete().eq('id', conversation.id)
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 })
    }

    // Fetch the complete conversation with participants
    const { data: fullConversation, error: fetchError } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        title,
        job_id,
        created_at,
        updated_at,
        last_message_at,
        archived,
        conversation_participants (
          id,
          user_id,
          role,
          last_read_at,
          joined_at,
          left_at
        )
      `)
      .eq('id', conversation.id)
      .single()

    if (fetchError) {
      console.error('Error fetching created conversation:', fetchError)
      return NextResponse.json({ error: 'Conversation created but failed to fetch' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      conversation: fullConversation,
      isNew: true
    })

  } catch (error) {
    console.error('Error creating job conversation:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
