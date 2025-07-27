import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  console.log('🚀 Role API: POST request received')
  
  try {
    console.log('Role API: Starting role update request...')
    
    // Debug: Log all cookies
    const allCookies = request.cookies.getAll()
    console.log('Role API: Available cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Look for Supabase auth cookies specifically
    const authCookies = allCookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('sb-')
    )
    console.log('Role API: Auth-related cookies:', authCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Check for Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Role API: Authorization header:', authHeader ? 'present' : 'missing')
    
    // Create Supabase client with request cookies
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name)
            console.log(`Role API: Getting cookie ${name}:`, cookie ? 'found' : 'not found')
            return cookie?.value
          },
          set() {
            // Not needed for this use case
          },
          remove() {
            // Not needed for this use case
          },
        },
        // Add global headers if Authorization header is present
        global: authHeader ? {
          headers: {
            'Authorization': authHeader
          }
        } : undefined
      }
    )

    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Role API: Auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError 
    })
    
    if (authError || !user) {
      console.log('Role API: No authenticated user, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()
    console.log('Role API: Requested role:', role)

    if (!role || !['tasker', 'client', 'company', 'admin'].includes(role)) {
      console.log('Role API: Invalid role provided:', role)
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 })
    }

    console.log('Role API: Updating user role in database...')
    // Update user role but keep profile_setup_completed as false
    // Profile will be marked as completed after the profile setup form
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        role: role,
        updated_at: new Date().toISOString()
        // Don't set profile_setup_completed here - will be set after profile setup
      })
      .eq('id', user.id)
      .select(`
        id,
        email,
        name,
        role,
        profile_setup_completed,
        email_verified,
        connections,
        created_at,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('Role API: Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }
    
    console.log('Role API: User updated successfully:', {
      id: updatedUser.id,
      role: updatedUser.role,
      profileSetupCompleted: updatedUser.profile_setup_completed,
      connections: updatedUser.connections
    })

    // TODO: Initialize connections based on role if needed
    // For now, connections are handled via database functions

    console.log('Role API: Returning success response')
    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      user: {
        ...updatedUser,
        profileSetupCompleted: updatedUser.profile_setup_completed,
        emailVerified: updatedUser.email_verified,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      }
    })
  } catch (error) {
    console.error('Role API: Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
