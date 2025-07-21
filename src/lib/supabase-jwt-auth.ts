import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import { auth } from './auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Default unauthenticated client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Function to create a Supabase JWT token that's compatible with RLS policies
function createSupabaseJWT(userId: string, userRole: string = 'authenticated') {
  if (!supabaseJwtSecret) {
    throw new Error('Missing SUPABASE_JWT_SECRET environment variable')
  }

  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
    sub: userId,
    role: userRole,
    iat: Math.floor(Date.now() / 1000),
    iss: 'supabase',
  }

  return jwt.sign(payload, supabaseJwtSecret)
}

// Create an authenticated Supabase client that works with RLS policies
export async function createAuthenticatedSupabaseClient() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return supabase
  }

  // Create a proper Supabase JWT token
  const supabaseToken = createSupabaseJWT(session.user.id, 'authenticated')

  // Create client with the JWT token
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
    },
  })
}

// Synchronous version for use in API routes where you already have user context
export function createServerSupabaseClient(userId: string, userRole: string = 'authenticated') {
  if (!userId) {
    return supabase
  }

  // Create a proper Supabase JWT token
  const supabaseToken = createSupabaseJWT(userId, userRole)

  // Create client with the JWT token
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
    },
  })
}

// Admin client for operations that need to bypass RLS (use sparingly!)
export function createSupabaseAdmin() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
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
