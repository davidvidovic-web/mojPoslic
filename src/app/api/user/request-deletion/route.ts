import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {
            // Not needed for this use case
          },
          remove() {
            // Not needed for this use case
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { reason } = body

    // Check if there's already a pending deletion request
    // supabase types can cause deep instantiation errors in TS here; cast to any as a narrow mitigation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any

    const { data: existingRequest } = await sb
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A deletion request already exists' },
        { status: 400 }
      )
    }

    // Calculate scheduled deletion date (30 days from now)
    const scheduledDeletion = new Date()
    scheduledDeletion.setDate(scheduledDeletion.getDate() + 30)

    // Create deletion request
    const { data: deletionRequest, error: insertError } = await sb
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        scheduled_deletion: scheduledDeletion.toISOString(),
        reason: reason || null,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating deletion request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create deletion request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deletionRequest
    })

  } catch (error) {
    console.error('Error requesting account deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Cancel deletion request
export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {
            // Not needed for this use case
          },
          remove() {
            // Not needed for this use case
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Cancel the deletion request
    // Cast to any (sb) to avoid deep type-instantiation errors while migrating types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any

    const { error: updateError } = await sb
      .from('account_deletion_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (updateError) {
      console.error('Error cancelling deletion request:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel deletion request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Deletion request cancelled'
    })

  } catch (error) {
    console.error('Error cancelling account deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
