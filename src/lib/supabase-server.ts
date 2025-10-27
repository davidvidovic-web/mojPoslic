import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Database } from './database.types'

// Server-side auth helper for App Router
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  // Ensure environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    return null
  }

  try {
    return createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
        global: {
          fetch: fetch.bind(globalThis)
        }
      }
    )
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    return null
  }
}

// Middleware helper for auth
export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Safely try to get user session, don't throw if it fails
  try {
    await supabase.auth.getUser()
  } catch {
    // Ignore auth errors in middleware - this is normal for unauthenticated users
    // or when coming from email verification links
  }

  return response
}

// Helper to get current user on server
export const getCurrentUser = async () => {
  const supabase = await createServerSupabaseClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return user
    }

    return {
      ...user,
      userData,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Helper to require authentication
export const requireAuth = async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

// Helper to check user role
export const checkUserRole = async (requiredRole: 'admin' | 'business_owner' | 'client') => {
  const user = await getCurrentUser()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(user as any)?.userData) {
    throw new Error('Authentication required')
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((user as any).userData.role !== requiredRole && (user as any).userData.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  
  return user
}
