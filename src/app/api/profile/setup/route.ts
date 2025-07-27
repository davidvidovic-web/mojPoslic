import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Profile Setup API: Authorization header:', authHeader ? 'present' : 'missing')
    
    // Create Supabase client with request cookies and auth header
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
    
    if (authError || !user) {
      console.log('Profile Setup API: Auth failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      username,
      phone,
      location,
      skills,
      skillExperiences,
      website,
      bio,
    } = body

    // Prepare update data
    const updateData: Record<string, string | string[] | boolean> = {
      updated_at: new Date().toISOString(),
      profile_setup_completed: true
    }

    if (name) updateData.name = name
    if (username) updateData.username = username
    if (phone) updateData.phone = phone
    if (location) updateData.location = location
    if (website) updateData.website = website
    if (bio) updateData.bio = bio
    
    // Handle skills array
    if (skills && Array.isArray(skills)) {
      updateData.skills = skills
    }
    
    // Handle skill experiences (convert to preferred_job_types or experience field)
    if (skillExperiences && Array.isArray(skillExperiences)) {
      updateData.experience = JSON.stringify(skillExperiences)
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select(`
        id,
        name,
        email,
        username,
        bio,
        phone,
        location,
        website,
        skills,
        experience,
        preferred_job_types,
        role,
        profile_setup_completed,
        created_at
      `)
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        location: updatedUser.location,
        website: updatedUser.website,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        preferredJobTypes: updatedUser.preferred_job_types ? updatedUser.preferred_job_types.split(', ') : [],
        role: updatedUser.role,
        profileSetupCompleted: updatedUser.profile_setup_completed,
        createdAt: updatedUser.created_at,
      }
    })
  } catch (error) {
    console.error('Profile setup error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
