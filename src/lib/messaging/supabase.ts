import { createClient, RealtimeChannel, RealtimeChannelOptions } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Default unauthenticated client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Enhanced client with NextAuth JWT integration
export class AuthenticatedSupabaseClient {
  private client: ReturnType<typeof createClient>
  private currentToken: string | null = null

  constructor() {
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }

  // Set the NextAuth JWT for real-time authentication
  setAuthToken(token: string | null) {
    if (token && token !== this.currentToken) {
      this.currentToken = token
      this.client.realtime.setAuth(token)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Supabase real-time auth token updated')
      }
    } else if (!token && this.currentToken) {
      this.currentToken = null
      this.client.realtime.setAuth(null)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Supabase real-time auth token cleared')
      }
    }
  }

  // Get the underlying Supabase client
  getClient() {
    return this.client
  }

  // Channel method for real-time subscriptions
  channel(name: string, options?: RealtimeChannelOptions) {
    return this.client.channel(name, options)
  }

  // Remove channel method
  removeChannel(channel: RealtimeChannel) {
    return this.client.removeChannel(channel)
  }
}

// Create a singleton instance
export const authenticatedSupabase = new AuthenticatedSupabaseClient()

// Function to create an authenticated Supabase client with a user token
export function createAuthenticatedSupabaseClient(accessToken?: string) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    },
  })

  // If we have an access token, set the session
  if (accessToken) {
    // Note: We can't actually set the session without the refresh token,
    // but we can pass the access token in headers for RLS policies
  }

  return client
}

// Type definitions for our database
export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          type: 'direct' | 'group' | 'job_related'
          title: string | null
          job_id: string | null
          created_at: string
          updated_at: string
          last_message_at: string | null
          archived: boolean
        }
        Insert: {
          id?: string
          type: 'direct' | 'group' | 'job_related'
          title?: string | null
          job_id?: string | null
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
          archived?: boolean
        }
        Update: {
          id?: string
          type?: 'direct' | 'group' | 'job_related'
          title?: string | null
          job_id?: string | null
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
          archived?: boolean
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          joined_at: string
          left_at: string | null
          role: 'admin' | 'member'
          last_read_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
          role?: 'admin' | 'member'
          last_read_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
          role?: 'admin' | 'member'
          last_read_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          message_type: 'text' | 'image' | 'file' | 'system'
          attachment_url: string | null
          attachment_filename: string | null
          attachment_size: number | null
          reply_to_message_id: string | null
          edited_at: string | null
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file' | 'system'
          attachment_url?: string | null
          attachment_filename?: string | null
          attachment_size?: number | null
          reply_to_message_id?: string | null
          edited_at?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file' | 'system'
          attachment_url?: string | null
          attachment_filename?: string | null
          attachment_size?: number | null
          reply_to_message_id?: string | null
          edited_at?: string | null
          deleted_at?: string | null
          created_at?: string
        }
      }
      message_status: {
        Row: {
          id: string
          message_id: string
          user_id: string
          status: 'sent' | 'delivered' | 'read'
          timestamp: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          status: 'sent' | 'delivered' | 'read'
          timestamp?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          status?: 'sent' | 'delivered' | 'read'
          timestamp?: string
        }
      }
    }
  }
}

export type ConversationRow = Database['public']['Tables']['conversations']['Row']
export type MessageRow = Database['public']['Tables']['messages']['Row']
export type ParticipantRow = Database['public']['Tables']['conversation_participants']['Row']
export type MessageStatusRow = Database['public']['Tables']['message_status']['Row']
