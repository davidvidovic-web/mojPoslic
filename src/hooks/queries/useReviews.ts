import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { CreateReviewData, ReviewResponse } from '@/types/review'

/**
 * Hook to create a new review
 */
export function useCreateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateReviewData & { reviewer_id: string; reviewer_name: string; reviewer_avatar_url?: string }) => {
      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          job_id: data.job_id,
          reviewer_id: data.reviewer_id,
          reviewee_id: data.reviewee_id,
          assignment_id: data.assignment_id || null,
          rating: data.rating,
          comment: data.comment || null,
          reviewer_name: data.reviewer_name,
          reviewer_avatar_url: data.reviewer_avatar_url || null,
        })
        .select()
        .single()

      if (error) throw error
      return review
    },
    onSuccess: (review) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byJob(review.job_id || '') })
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byUser(review.reviewee_id || '') })
    },
  })
}

/**
 * Hook to respond to a review
 */
export function useRespondToReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ReviewResponse) => {
      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          response: data.response,
          response_at: new Date().toISOString(),
        })
        .eq('id', data.review_id)
        .select()
        .single()

      if (error) throw error
      return review
    },
    onSuccess: (review) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byJob(review.job_id || '') })
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.detail(review.id) })
    },
  })
}

/**
 * Hook to get reviews for a specific job
 */
export function useJobReviewsQuery(jobId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byJob(jobId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!jobId,
  })
}

/**
 * Hook to get reviews for a specific user (as reviewee)
 */
export function useUserReviewsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byUser(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

/**
 * Hook to get review statistics for a user
 */
export function useUserReviewStats(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.stats(userId || ''),
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', userId)

      if (error) throw error
      
      if (!data || data.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
        }
      }

      const totalReviews = data.length
      const averageRating = data.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews

      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews,
      }
    },
    enabled: !!userId,
  })
}
