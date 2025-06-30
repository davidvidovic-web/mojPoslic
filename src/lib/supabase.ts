import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For client-side operations
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Legacy client for backward compatibility
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
