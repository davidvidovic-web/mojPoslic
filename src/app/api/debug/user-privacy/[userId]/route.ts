import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Create service role client to bypass RLS
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

    // Get ALL user data to debug privacy settings
    const { data: user, error } = await supabaseService
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        avatar_url,
        company_name,
        privacy_show_email,
        privacy_show_phone,
        privacy_profile_visibility
      `)
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'User not found', details: error }, { status: 404 })
    }

    return NextResponse.json({
      rawData: user,
      phoneExists: !!user.phone,
      phoneValue: user.phone,
      privacyShowPhone: user.privacy_show_phone,
      privacyShowPhoneType: typeof user.privacy_show_phone,
      shouldShowPhone: user.privacy_show_phone === true,
      logicalCheck: {
        isExplicitlyTrue: user.privacy_show_phone === true,
        isExplicitlyFalse: user.privacy_show_phone === false,
        isNull: user.privacy_show_phone === null,
        isUndefined: user.privacy_show_phone === undefined
      }
    })

  } catch (error) {
    console.error('Error in debug profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}