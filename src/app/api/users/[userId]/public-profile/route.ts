import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    // Check if this is for job contact information
    const { searchParams } = new URL(request.url)
    const forJobContact = searchParams.get('forJobContact') === 'true'

    // Create service role client to bypass RLS for public profile data
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

    // Get public profile information respecting privacy settings
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
      console.error('Error fetching public profile:', error)
      
      // Fallback to auth.users if not found in custom users table
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
        
        if (authUser?.user) {
          const userName = authUser.user.user_metadata?.name || 
                         authUser.user.user_metadata?.full_name || 
                         authUser.user.email?.split('@')[0] || 
                         'Unknown User'
          
          // Apply same formatting for auth fallback
          const formatNameForJob = (fullName: string) => {
            if (!fullName) return fullName
            const nameParts = fullName.trim().split(' ')
            if (nameParts.length === 1) return nameParts[0]
            
            const firstName = nameParts[0]
            const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
            return `${firstName} ${lastNameInitial}.`
          }
          
          const formatPhoneForJob = (phone: string | null) => {
            if (!phone) return phone
            const cleanPhone = phone.trim()
            if (cleanPhone.startsWith('+')) return cleanPhone
            if (cleanPhone.startsWith('387')) return `+${cleanPhone}`
            return `+387 ${cleanPhone}`
          }
          
          const displayName = forJobContact ? formatNameForJob(userName) : userName
          const authPhone = authUser.user.user_metadata?.phone || null
          const displayPhone = forJobContact ? formatPhoneForJob(authPhone) : authPhone
          
          return NextResponse.json({
            id: authUser.user.id,
            name: displayName,
            email: authUser.user.email,
            phone: displayPhone,
            avatar_url: null,
            company_name: null,
            // Default privacy settings for auth-only users
            showEmail: true,
            showPhone: false
          })
        }
      } catch (authError) {
        console.error('Error accessing auth.users:', authError)
      }

      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Apply privacy settings to determine what information to show
    // For job contact info, show phone regardless of privacy settings
    
    // Format name: "FirstName FirstLetterOfLastName." (e.g., "David V.")
    const formatNameForJob = (fullName: string) => {
      if (!fullName) return fullName
      const nameParts = fullName.trim().split(' ')
      if (nameParts.length === 1) return nameParts[0] // Single name
      
      const firstName = nameParts[0]
      const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      return `${firstName} ${lastNameInitial}.`
    }
    
    // Format phone: Add +387 prefix if not already present
    const formatPhoneForJob = (phone: string | null) => {
      if (!phone) return phone
      const cleanPhone = phone.trim()
      if (cleanPhone.startsWith('+')) return cleanPhone // Already has country code
      if (cleanPhone.startsWith('387')) return `+${cleanPhone}` // Has 387 but no +
      return `+387 ${cleanPhone}` // Add full prefix
    }
    
    const displayName = forJobContact ? formatNameForJob(user.name) : user.name
    const displayPhone = forJobContact ? formatPhoneForJob(user.phone) : user.phone
    
    const publicProfile = {
      id: user.id,
      name: displayName,
      email: (user.privacy_show_email !== false || forJobContact) ? user.email : null,
      phone: (user.privacy_show_phone === true || forJobContact) ? displayPhone : null,
      avatar_url: user.avatar_url,
      company_name: user.company_name,
      showEmail: user.privacy_show_email !== false || forJobContact,
      showPhone: user.privacy_show_phone === true || forJobContact
    }

    return NextResponse.json(publicProfile)

  } catch (error) {
    console.error('Error in public profile API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}