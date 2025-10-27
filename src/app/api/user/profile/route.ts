import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

export async function PUT(request: NextRequest) {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('authorization')
    
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
      console.error('Profile API PUT: Auth failed:', authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      bio,
      phone,
      location,
      website,
      skills,
      experience,
      preferredJobTypes,
      avatarUrl,
      // resumeUrl, // TODO: Enable after adding column to database
    } = await request.json();

    // Get current user to check role and profile setup status
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role, profile_setup_completed')
      .eq('id', user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Base update data - only allow changes to basic fields if profile setup is not completed
    const baseUpdateData: Record<string, string | boolean | string[] | null> = {};

    // If profile setup is not completed, allow basic field updates
    if (!currentUser.profile_setup_completed) {
      if (name !== undefined) baseUpdateData.name = name;
      if (phone !== undefined) baseUpdateData.phone = phone;
      if (location !== undefined) baseUpdateData.location = location;
    }

    // Website and avatar are always updatable
    if (website !== undefined) baseUpdateData.website = website;
    if (avatarUrl !== undefined) baseUpdateData.avatar_url = avatarUrl;
    
    // Privacy settings (embedded) - prepare for migration
    // TODO: Uncomment after adding privacy columns to users table
    // if (privacyEmailVisible !== undefined) baseUpdateData.privacy_email_visible = privacyEmailVisible;
    // if (privacyPhoneVisible !== undefined) baseUpdateData.privacy_phone_visible = privacyPhoneVisible;
    // if (privacyProfileVisible !== undefined) baseUpdateData.privacy_profile_visible = privacyProfileVisible;
    // if (privacyContactFormEnabled !== undefined) baseUpdateData.privacy_contact_form_enabled = privacyContactFormEnabled;
    
    // TODO: Add resume_url after adding column to Supabase database
    // if (resumeUrl !== undefined) baseUpdateData.resume_url = resumeUrl;

    // Only include professional fields for non-client roles
    if (currentUser.role !== "client") {
      if (bio !== undefined) baseUpdateData.bio = bio;
      
      // Handle skills array conversion - convert comma-separated string to array
      if (skills !== undefined) {
        baseUpdateData.skills = Array.isArray(skills)
          ? skills
          : typeof skills === 'string'
            ? skills.split(',').map(s => s.trim()).filter(Boolean)
            : null;
      }
      
      if (experience !== undefined) baseUpdateData.experience = experience;

      // Handle preferred job types array conversion
      if (preferredJobTypes !== undefined) {
        baseUpdateData.preferred_job_types = Array.isArray(preferredJobTypes)
          ? preferredJobTypes.join(", ")
          : preferredJobTypes;
      }
    }

    // Update the user with validated data
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(baseUpdateData)
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
        preferred_language,
        role,
        profile_setup_completed,
        email_verified,
        created_at,
        avatar_url
      `)
      .single()

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Convert field names and preferred job types for frontend consumption
    const userWithArrayJobTypes = {
      ...updatedUser,
      skills: updatedUser.skills || [],
      preferredJobTypes: updatedUser.preferred_job_types
        ? updatedUser.preferred_job_types.split(", ")
        : [],
      preferredLanguage: updatedUser.preferred_language,
      profileSetupCompleted: updatedUser.profile_setup_completed,
      emailVerified: updatedUser.email_verified,
      createdAt: updatedUser.created_at,
      avatarUrl: updatedUser.avatar_url,
      
      // Privacy settings (embedded) - placeholder for migration
      // TODO: Uncomment after adding privacy columns to users table
      // privacyEmailVisible: updatedUser.privacy_email_visible ?? true,
      // privacyPhoneVisible: updatedUser.privacy_phone_visible ?? false,
      // privacyProfileVisible: updatedUser.privacy_profile_visible ?? true,
      // privacyContactFormEnabled: updatedUser.privacy_contact_form_enabled ?? true,
      
      // Performance data (placeholder for migration)
      // totalJobsPosted: updatedUser.total_jobs_posted ?? 0,
      // totalApplicationsSent: updatedUser.total_applications_sent ?? 0,
      // profileCompletionScore: updatedUser.profile_completion_score ?? 0,
      // lastLoginAt: updatedUser.last_login_at,
      
      // TODO: Add resumeUrl after adding column to database
      // resumeUrl: updatedUser.resume_url,
    };

    return NextResponse.json({ user: userWithArrayJobTypes });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('authorization')
    
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
      console.error('Profile API GET: Auth failed:', authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
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
        preferred_language,
        role,
        profile_setup_completed,
        email_verified,
        created_at,
        avatar_url
      `)
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert field names and preferred job types for frontend consumption
    const userWithArrayJobTypes = {
      ...userData,
      skills: userData.skills || [],
      preferredJobTypes: userData.preferred_job_types
        ? userData.preferred_job_types.split(", ")
        : [],
      preferredLanguage: userData.preferred_language,
      profileSetupCompleted: userData.profile_setup_completed,
      emailVerified: userData.email_verified,
      createdAt: userData.created_at,
      avatarUrl: userData.avatar_url,
      
      // Privacy settings (embedded) - placeholder for migration
      // TODO: Uncomment after adding privacy columns to users table
      // privacyEmailVisible: userData.privacy_email_visible ?? true,
      // privacyPhoneVisible: userData.privacy_phone_visible ?? false,
      // privacyProfileVisible: userData.privacy_profile_visible ?? true,
      // privacyContactFormEnabled: userData.privacy_contact_form_enabled ?? true,
      
      // Performance data (placeholder for migration)
      // totalJobsPosted: userData.total_jobs_posted ?? 0,
      // totalApplicationsSent: userData.total_applications_sent ?? 0,
      // profileCompletionScore: userData.profile_completion_score ?? 0,
      // lastLoginAt: userData.last_login_at,
      
      // TODO: Add resumeUrl after adding column to database
      // resumeUrl: userData.resume_url,
    };

    return NextResponse.json({ user: userWithArrayJobTypes });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
