import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  console.log('🚀 Role API: POST request received')
  
  try {
    console.log('Role API: Starting role update request...')
    
    // Check for Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Role API: Authorization header:', authHeader ? 'present' : 'missing')
    
    // Create Supabase auth client with request cookies for user verification
    const supabaseAuth = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
        global: authHeader ? {
          headers: { 'Authorization': authHeader }
        } : undefined
      }
    )

    // Create service client for database operations (bypasses RLS)
    const supabaseService = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('Role API: Service role key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    
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
    
    // First, check if user exists in users table
    const { data: existingUser, error: checkError } = await supabaseService
      .from('users')
      .select('id, email, name, role, profile_setup_completed, email_verified, connections, created_at, updated_at')
      .eq('id', user.id)
      .single()

    console.log('Role API: User check result:', { 
      userExists: !!existingUser, 
      checkError: checkError?.code,
      userId: user.id 
    })

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Role API: Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Failed to check user status' },
        { status: 500 }
      )
    }

    let updatedUser
    if (!existingUser) {
      console.log('Role API: User not found in users table, creating new user record...')
      const { data: newUser, error: createError } = await supabaseService
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email!.split('@')[0],
          role: role,
          email_verified: !!user.email_confirmed_at,
          profile_setup_completed: false,
          connections: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, email, name, role, profile_setup_completed, email_verified, connections, created_at, updated_at')
        .single()

      if (createError) {
        console.error('Role API: Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        )
      }
      updatedUser = newUser
      console.log('Role API: New user created successfully')
    } else {
      console.log('Role API: Updating existing user role...')
      const { data: updated, error: updateError } = await supabaseService
        .from('users')
        .update({
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('id, email, name, role, profile_setup_completed, email_verified, connections, created_at, updated_at')
        .single()

      if (updateError) {
        console.error('Role API: Database update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user role' },
          { status: 500 }
        )
      }
      updatedUser = updated
    }
    
    console.log('Role API: User updated successfully:', {
      id: updatedUser.id,
      role: updatedUser.role,
      profileSetupCompleted: updatedUser.profile_setup_completed,
      connections: updatedUser.connections
    })

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
