/**
 * TanStack Query client configuration
 * Centralized query client setup with optimized defaults
 */

import { QueryClient } from '@tanstack/react-query'

// Create a singleton query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Background refetch intervals
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && 'status' in error) {
          const status = (error as Error & { status?: number }).status
          if (status && status >= 400 && status < 500) {
            return false
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Background refetch settings
      refetchOnWindowFocus: false, // Disable aggressive refetching
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      // Global mutation error handling
      onError: (error) => {
        // Enhanced error logging with more details
        console.error('Mutation error:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          error: error,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
      },
    },
  },
})

// Helper function to invalidate all job-related queries
export const invalidateJobQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['jobs'] })
}

// Helper function to invalidate all user-related queries
export const invalidateUserQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['users'] })
}

// Helper function to invalidate all data queries (categories, cities)
export const invalidateDataQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['data'] })
}

// Helper function to invalidate all admin-related queries
export const invalidateAdminQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['admin'] })
}

export default queryClient
