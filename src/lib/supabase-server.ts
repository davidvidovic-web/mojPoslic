import { createClient } from '@supabase/supabase-js'
import { auth } from './auth'

// Ensure this file is only used on server-side
if (typeof window !== 'undefined') {
  throw new Error('supabase-server.ts can only be used on server-side')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create authenticated Supabase client by using admin client with user context
export async function createAuthenticatedSupabaseClient() {
  const session = await auth()
  
  if (!session?.user?.id) {
    // Return unauthenticated client for unauthenticated users
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  // For now, use admin client for all operations
  // TODO: Implement proper RLS policies or custom JWT when Supabase is configured properly
  return createSupabaseAdmin()
}

// For API routes where you already have user context
export function createServerSupabaseClient(userId: string) {
  if (!userId) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  // For now, use admin client for authenticated operations
  // TODO: Implement proper JWT authentication when Supabase JWT secret is available
  return createSupabaseAdmin()
}

// Admin client for operations that need to bypass RLS
export function createSupabaseAdmin() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
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

// Helper to get user context from NextAuth session
export async function getUserContext() {
  const session = await auth()
  return {
    userId: session?.user?.id,
    userRole: session?.user?.role || 'authenticated',
    isAuthenticated: !!session?.user?.id,
  }
}
