import { createClient } from '@supabase/supabase-js'
import { auth } from './auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Default unauthenticated client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We'll handle auth through NextAuth
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Admin client for operations that need to bypass RLS (use sparingly!)
export function createSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Create an authenticated Supabase client for server-side operations
export async function createAuthenticatedSupabaseClient() {
  const session = await auth()
  
  if (!session?.user?.id) {
    // Return unauthenticated client if no session
    return supabase
  }

  // Create client with user context for RLS
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        // Pass the user ID in a custom header that RLS policies can read
        'x-user-id': session.user.id,
        'x-user-role': session.user.role || 'user',
      },
    },
  })
}

// Create a Supabase client with proper authentication for API routes
export function createServerSupabaseClient(userId?: string, userRole?: string) {
  if (!userId) {
    return supabase
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole || 'user',
      },
    },
  })
}

// Helper to get user context from NextAuth session
export async function getUserContext() {
  const session = await auth()
  return {
    userId: session?.user?.id,
    userRole: session?.user?.role || 'user',
    isAuthenticated: !!session?.user?.id,
  }
}
