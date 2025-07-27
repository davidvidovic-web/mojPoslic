import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export const createRouteClient = () =>
  createRouteHandlerClient<Database>({ cookies })
