import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useUserName(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-name', userId],
    queryFn: async () => {
      if (!userId) return null
      
      console.log('🔍 useUserName: Fetching name for userId:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .maybeSingle()
      
      console.log('🔍 useUserName: Query result:', { data, error, userId })
      
      if (error) {
        console.warn('Failed to fetch user name:', error)
        return null
      }
      
      return data?.name || null
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  })
}
