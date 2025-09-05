import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, type, title, message, data } = body

    console.log('🧪 Test notification API - Creating notification:', {
      user_id,
      type,
      title,
      message,
      data
    })

    // Use service role client to create notification (bypasses RLS)
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: notificationData, error } = await supabaseService
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        data,
        is_read: false
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to create test notification:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Test notification created successfully:', notificationData)

    return NextResponse.json({
      success: true,
      data: notificationData
    })

  } catch (error) {
    console.error('❌ Test notification API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
