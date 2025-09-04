'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/query-keys'
import type { Database } from '@/types/supabase'
import type { JobFilters } from '@/types/job'
import { useData } from '@/hooks/use-data'
type JobListing = Database['public']['Tables']['job_listings']['Row']
type JobUpdate = Database['public']['Tables']['job_listings']['Update']
// Standard job listing columns for consistent queries (including the new application_url column)
const JOB_LISTING_COLUMNS = `
  id,
  title,
  description,
  job_type,
  city_id,
  category_id,
  posted_by_id,
  requirements,
  benefits,
  salary_type,
  salary_min,
  salary_max,
  contact_info,
  exact_location,
  latitude,
  longitude,
  is_active,
  is_featured,
  status,
  created_at,
  updated_at,
  application_deadline,
  currency,
  duration_days,
  is_salary_negotiable,
  is_urgent,
  salary_amount,
  subcategory_id,
  application_url
` as const
export function useJobsQuery(filters: JobFilters = {}) {
  const { getCityByKey, getCategoryByKey } = useData()
  
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('job_listings')
        .select(`
          ${JOB_LISTING_COLUMNS},
          posted_by:users(name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      if (filters.city && filters.city !== 'all') {
        query = query.eq('city_id', filters.city)
      }
      
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category)
      }
      
      if (filters.type && filters.type !== 'all') {
        query = query.eq('job_type', filters.type)
      }
      
      if (filters.salaryMin) {
        query = query.gte('salary_min', filters.salaryMin)
      }
      
      if (filters.salaryMax) {
        query = query.lte('salary_max', filters.salaryMax)
      }
      // Pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }
      const { data, error, count } = await query
      if (error) throw error
      
      // Note: Using type assertion since Supabase query returns complex joined data
      const transformedJobs = (data || []).map((job) => {
        const typedJob = job as JobListing & {
          posted_by?: { name?: string } | null
        }
        
        // Get city and category data using keys
        const cityData = getCityByKey(typedJob.city_id || '')
        const categoryData = getCategoryByKey(typedJob.category_id || '')
        
        return {
          id: typedJob.id,
          title: typedJob.title,
          company: typedJob.posted_by?.name || 'Company',
          city_id: typedJob.city_id || '', // Handle null case
          city: cityData ? {
            id: cityData.id,
            key: cityData.key,
            name_bs: cityData.name_bs,
            name_en: cityData.name_en,
            name: cityData.name,
            country: cityData.country || 'Bosnia and Herzegovina'
          } : undefined,
          category_id: typedJob.category_id || '',
          category: categoryData ? {
            id: categoryData.id,
            key: categoryData.key,
            name_bs: categoryData.name_bs,
            name_en: categoryData.name_en,
            name: categoryData.name,
          } : undefined,
          type: typedJob.job_type as 'quick_job' | 'full_time' | 'part_time' | 'remote',
          description: typedJob.description,
          requirements: typedJob.requirements || '',
          benefits: typedJob.benefits || '',
          salary: typedJob.salary_amount?.toString() || '',
          salaryAmount: typedJob.salary_amount,
          salaryType: typedJob.salary_type || undefined,
          salaryMin: typedJob.salary_min || undefined,
          salaryMax: typedJob.salary_max || undefined,
          email: '', // Will be populated from contact_info if needed
          website: '',
          phone: '',
          exactLocation: typedJob.exact_location,
          isActive: typedJob.is_active,
          isFeatured: typedJob.is_featured,
          postedById: typedJob.posted_by_id,
          createdAt: typedJob.created_at || '',
          updatedAt: typedJob.updated_at,
        }
      })
      
      return {
        data: transformedJobs,
        total: count || 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  })
}
export function useJobQuery(jobId: string) {
  const { getCityByKey, getCategoryByKey } = useData()
  
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          posted_by:users(
            id, name, avatar_url, 
            bio, created_at, location
          ),
          applications:applications(
            id, status, applied_at,
            user:users(name, avatar_url)
          )
        `)
        .eq('id', jobId)
        .single()
      if (error) throw error
      
      // Enhance the job data with city and category information
      if (data) {
        const cityData = getCityByKey(data.city_id || '')
        const categoryData = getCategoryByKey(data.category_id || '')
        
        return {
          ...data,
          city: cityData ? {
            id: cityData.id,
            key: cityData.key,
            name_bs: cityData.name_bs,
            name_en: cityData.name_en,
            name: cityData.name,
            country: cityData.country || 'Bosnia and Herzegovina'
          } : undefined,
          category: categoryData ? {
            id: categoryData.id,
            key: categoryData.key,
            name_bs: categoryData.name_bs,
            name_en: categoryData.name_en,
            name: categoryData.name,
          } : undefined,
        }
      }
      
      return data
    },
    enabled: !!jobId,
  })
}
export function useUserJobsQuery(userId: string) {
  const { getCityByKey, getCategoryByKey } = useData()
  
  return useQuery({
    queryKey: queryKeys.jobs.list({ postedBy: userId }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('posted_by_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      
      // Return jobs with minimal transformation - the database already has cached names
      const enhancedJobs = (data || []).map(job => {
        try {
          // Cast to include cached name fields that exist in DB but not in types
          const jobWithCachedFields = job as typeof job & {
            city_name?: string
            city_name_bs?: string  
            city_name_en?: string
            category_name?: string
            category_name_bs?: string
            category_name_en?: string
          }
          
          // If the job doesn't have cached names (legacy data), enhance with lookup
          if (!jobWithCachedFields.city_name && job.city_id) {
            const cityData = getCityByKey(job.city_id || '')
            if (cityData) {
              jobWithCachedFields.city_name = cityData.name_en || cityData.name_bs || cityData.name || job.city_id
              jobWithCachedFields.city_name_bs = cityData.name_bs || cityData.name_en || cityData.name || job.city_id  
              jobWithCachedFields.city_name_en = cityData.name_en || cityData.name_bs || cityData.name || job.city_id
            }
          }
          
          if (!jobWithCachedFields.category_name && job.category_id) {
            const categoryData = getCategoryByKey(job.category_id || '')
            if (categoryData) {
              jobWithCachedFields.category_name = categoryData.name_en || categoryData.name_bs || categoryData.name || job.category_id
              jobWithCachedFields.category_name_bs = categoryData.name_bs || categoryData.name_en || categoryData.name || job.category_id
              jobWithCachedFields.category_name_en = categoryData.name_en || categoryData.name_bs || categoryData.name || job.category_id
            }
          }
          
          // Also add nested objects for components that expect them
          const cityData = getCityByKey(job.city_id || '')
          const categoryData = getCategoryByKey(job.category_id || '')
          
          return {
            ...jobWithCachedFields,
            // Map database fields to expected Job interface fields
            type: jobWithCachedFields.job_type || 'quick_job', // Map job_type to type
            salary: jobWithCachedFields.salary_amount || null, // Map salary_amount to salary
            salaryMin: jobWithCachedFields.salary_min, // Map salary_min to salaryMin
            salaryMax: jobWithCachedFields.salary_max, // Map salary_max to salaryMax  
            salaryType: jobWithCachedFields.salary_type, // Map salary_type to salaryType
            posted_at: jobWithCachedFields.created_at, // Map created_at to posted_at
            createdAt: jobWithCachedFields.created_at, // Also keep createdAt for compatibility
            expires_at: jobWithCachedFields.application_deadline, // Map application_deadline to expires_at
            start_date: null, // Not available in database schema
            duration: jobWithCachedFields.duration_days ? `${jobWithCachedFields.duration_days} days` : null,
            tags: [], // Not available in database schema, ensure tags is an array
            // Location fields mapping  
            job_address: jobWithCachedFields.exact_location, // Map exact_location to job_address for compatibility
            job_latitude: jobWithCachedFields.latitude, // Map latitude to job_latitude
            job_longitude: jobWithCachedFields.longitude, // Map longitude to job_longitude
            city: cityData ? {
              id: cityData.id,
              key: cityData.key,
              name_bs: cityData.name_bs,
              name_en: cityData.name_en,
              name: cityData.name_en || cityData.name_bs || cityData.name || jobWithCachedFields.city_name || job.city_id,
              country: cityData.country || 'Bosnia and Herzegovina'
            } : (jobWithCachedFields.city_name ? {
              id: job.city_id || '',
              key: job.city_id || '',
              name_bs: jobWithCachedFields.city_name_bs || jobWithCachedFields.city_name || job.city_id || '',
              name_en: jobWithCachedFields.city_name_en || jobWithCachedFields.city_name || job.city_id || '',
              name: jobWithCachedFields.city_name || job.city_id || '',
              country: 'Bosnia and Herzegovina'
            } : undefined),
            category: categoryData ? {
              id: categoryData.id,
              key: categoryData.key,
              name_bs: categoryData.name_bs,
              name_en: categoryData.name_en,
              name: categoryData.name_en || categoryData.name_bs || categoryData.name || jobWithCachedFields.category_name || job.category_id,
            } : (jobWithCachedFields.category_name ? {
              id: job.category_id || '',
              key: job.category_id || '',
              name_bs: jobWithCachedFields.category_name_bs || jobWithCachedFields.category_name || job.category_id || '',
              name_en: jobWithCachedFields.category_name_en || jobWithCachedFields.category_name || job.category_id || '',
              name: jobWithCachedFields.category_name || job.category_id || '',
            } : undefined),
          }
        } catch (error) {
          console.error('useUserJobsQuery - Error processing job:', job.id, error)
          // Return the job as-is if transformation fails
          return job
        }
      })
      
      return enhancedJobs
    },
    enabled: !!userId,
  })
}
export function useFeaturedJobsQuery() {
  const { getCityByKey, getCategoryByKey } = useData()
  
  return useQuery({
    queryKey: queryKeys.jobs.list({ featured: true }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          posted_by:users(name, avatar_url)
        `)
        .eq('is_featured', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) throw error
      
      // Enhance jobs with city and category data
      const enhancedJobs = (data || []).map(job => {
        const cityData = getCityByKey(job.city_id || '')
        const categoryData = getCategoryByKey(job.category_id || '')
        
        return {
          ...job,
          city: cityData ? {
            id: cityData.id,
            key: cityData.key,
            name_bs: cityData.name_bs,
            name_en: cityData.name_en,
            name: cityData.name,
            country: cityData.country || 'Bosnia and Herzegovina'
          } : undefined,
          category: categoryData ? {
            id: categoryData.id,
            key: categoryData.key,
            name_bs: categoryData.name_bs,
            name_en: categoryData.name_en,
            name: categoryData.name,
          } : undefined,
        }
      })
      
      return enhancedJobs
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - featured jobs don't change often
  })
}
export function useSavedJobsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.jobs.saved(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          *,
          job:job_listings(
            *,
            posted_by:users(name),
            
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
// API job creation data format
interface CreateJobAPIData {
  title: string
  description: string
  type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  city_id: string
  category_id?: string
  requirements?: string | null
  benefits?: string | null
  salaryType?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  application_url?: string | null
  website?: string | null
  email?: string | null
  contact_email?: string | null
  job_address?: string | null
  job_latitude?: number | null
  job_longitude?: number | null
  start_date?: string | null
  start_time?: string | null
  duration_days?: number | null
}
export function useCreateJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (jobData: CreateJobAPIData) => {
      // Get session token for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(jobData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create job')
      }
      const result = await response.json()
      return result.data
    },
    onSuccess: (newJob) => {
      // Invalidate job lists
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
      
      // Add to cache
      queryClient.setQueryData(queryKeys.jobs.detail(newJob.id), newJob)
      
      // Invalidate user's jobs if posted_by_id exists
      if (newJob.posted_by_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.jobs.list({ postedBy: newJob.posted_by_id }) 
        })
      }
    },
  })
}
export function useUpdateJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: JobUpdate }) => {
      const { data, error } = await supabase
        .from('job_listings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          posted_by:users(name, avatar_url)
          
        `)
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (updatedJob) => {
      // Update cache
      queryClient.setQueryData(queryKeys.jobs.detail(updatedJob.id), updatedJob)
      
      // Invalidate job lists
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
      
      // Invalidate user's jobs if posted_by_id exists
      if (updatedJob.posted_by_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.jobs.list({ postedBy: updatedJob.posted_by_id }) 
        })
      }
    },
  })
}
export function useDeleteJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobId)
      if (error) throw error
      return jobId
    },
    onSuccess: (jobId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.jobs.detail(jobId) })
      
      // Invalidate job lists
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    },
  })
}
export function useSaveJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, jobId }: { userId: string; jobId: string }) => {
      const { data, error } = await supabase
        .from('saved_jobs')
        .insert([{ user_id: userId, job_id: jobId }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, { userId }) => {
      // Invalidate saved jobs
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.saved(userId) })
    },
  })
}
export function useUnsaveJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, jobId }: { userId: string; jobId: string }) => {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId)
      if (error) throw error
      return { userId, jobId }
    },
    onSuccess: (_, { userId }) => {
      // Invalidate saved jobs
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.saved(userId) })
    },
  })
}
export function useJobViewMutation() {
  return useMutation({
    mutationFn: async ({ jobId, userId }: { jobId: string; userId?: string }) => {
      const { data, error } = await supabase
        .from('job_views')
        .insert([{ 
          job_id: jobId, 
          user_id: userId || null,
          viewed_at: new Date().toISOString()
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    // Don't need onSuccess for view tracking - it's fire and forget
  })
}
// ===== APPLICATION HOOKS =====
type ApplicationUpdate = Database['public']['Tables']['applications']['Update']
// Import ApplicationFilters from query-keys to avoid duplication
import type { ApplicationFilters } from '@/lib/query-keys'
// Re-export for convenience
export type { ApplicationFilters }
export function useApplicationsQuery(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: queryKeys.jobs.applications(filters),
    queryFn: async () => {
      let query = supabase
        .from('applications')
        .select(`
          *,
          job:job_listings!applications_job_id_fkey(
            id, title, job_type, city_id, category_id, salary_min, salary_max, salary_type,
            
            posted_by:users(name)
          ),
          user:users(id, name, email, avatar_url)
        `)
        .order('applied_at', { ascending: false })
      // Apply filters
      if (filters?.status) {
        const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status]
        query = query.in('status', statusArray as Database['public']['Enums']['application_status'][])
      }
      
      if (filters?.jobId) {
        query = query.eq('job_id', filters.jobId)
      }
      
      if (filters?.dateFrom) {
        const dateFrom = filters.dateFrom instanceof Date ? filters.dateFrom.toISOString() : filters.dateFrom
        query = query.gte('applied_at', dateFrom)
      }
      
      if (filters?.dateTo) {
        const dateTo = filters.dateTo instanceof Date ? filters.dateTo.toISOString() : filters.dateTo
        query = query.lte('applied_at', dateTo)
      }
      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Query hook for fetching applications for a specific job using the API endpoint
 * This provides better authentication and permission handling
 */
export function useJobApplicationsQuery(jobId: string) {
  return useQuery({
    queryKey: ['job-applications', jobId], // Use a unique key to avoid conflicts
    queryFn: async () => {
      // Get session token for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch job applications')
      }

      const result = await response.json()
      return result.data || []
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
export function useApplicationQuery(applicationId: string) {
  return useQuery({
    queryKey: queryKeys.jobs.application(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:job_listings!applications_job_id_fkey(
            id, title, description, job_type, city_id, category_id, salary_min, salary_max, salary_type,
            
            posted_by:users(name, email, avatar_url)
          ),
          user:users(id, name, email, avatar_url)
        `)
        .eq('id', applicationId)
        .single()
      if (error) throw error
      return data
    },
  })
}
export function useUserApplicationsQuery(userId?: string) {
  return useQuery({
    queryKey: queryKeys.jobs.userApplications(userId),
    queryFn: async () => {
      if (!userId) return []
      
      console.log('🔍 Fetching applications for user:', userId)
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:job_listings!applications_job_id_fkey(
            id, title, job_type, city_id, category_id, salary_min, salary_max, salary_type,
            
            posted_by:users(name)
          )
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false })
      
      console.log('🔍 Applications query result:', {
        userId,
        count: data?.length || 0,
        error: error?.message,
        firstApplication: data?.[0] ? {
          id: data[0].id,
          status: data[0].status,
          job_title: data[0].job?.title,
          applied_at: data[0].applied_at
        } : null
      })
      
      if (error) throw error
      return data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
export function useUserAppliedJobsQuery(userId?: string) {
  return useQuery({
    queryKey: queryKeys.jobs.userAppliedJobs(userId),
    queryFn: async () => {
      if (!userId) return new Set<string>()
      
      const { data, error } = await supabase
        .from('applications')
        .select('job_id')
        .eq('user_id', userId)
      if (error) throw error
      
      // Return Set of job IDs for quick lookup
      return new Set(data?.map(app => app.job_id).filter(Boolean) || [])
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
export function useCreateApplicationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ jobId, coverLetter, clientNotes }: { jobId: string; coverLetter?: string; clientNotes?: string }) => {
      // Get current session for authorization header
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to apply for jobs')
      }

      // Call the simplified API route
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          jobId,
          coverLetter,
          clientNotes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application')
      }

      return result.data
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.userApplications(data.user_id!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.userAppliedJobs(data.user_id!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(variables.jobId) })
    },
  })
}
export function useUpdateApplicationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ applicationId, updates }: { applicationId: string; updates: ApplicationUpdate }) => {
      const { data, error } = await supabase
        .from('applications')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select(`
          *,
          job:job_listings!applications_job_id_fkey(
            id, title, job_type,
            posted_by:users(name)
          ),
          user:users(id, name, email)
        `)
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(queryKeys.jobs.application(data.id), data)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.userApplications(data.user_id!) })
    },
  })
}
// ===== JOB STATUS MANAGEMENT =====
export function useUpdateJobStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: Database['public']['Enums']['job_status'] }) => {
      const { data, error } = await supabase
        .from('job_listings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select(`
          *,
          posted_by:users(name, avatar_url)
          
        `)
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(queryKeys.jobs.detail(data.id), data)
      
      // Invalidate job lists to reflect status change
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
      
      // Invalidate user's jobs if posted_by_id exists
      if (data.posted_by_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.jobs.list({ postedBy: data.posted_by_id }) 
        })
      }
    },
  })
}
// ===== ACTIVE JOBS SYSTEM =====
export interface ActiveJob {
  assignmentId: string
  jobId: string
  title: string
  company: string
  description: string
  salary?: string
  salaryType?: string
  salaryMin?: number
  salaryMax?: number
  agreedSalary?: number
  startDate?: string
  startTime?: string
  duration?: string
  jobAddress?: string
  contractStatus: string
  assignedAt: string
  appliedAt: string
  selectedAt?: string
  applicationMessage?: string
  notes?: string
  client: {
    id: string
    name?: string
    email?: string
    companyName?: string
  }
}
export function useActiveJobsQuery(userId?: string) {
  return useQuery({
    queryKey: queryKeys.jobs.activeJobs(userId),
    queryFn: async (): Promise<ActiveJob[]> => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          applied_at,
          updated_at,
          cover_letter,
          client_notes,
          status,
          job:job_listings!applications_job_id_fkey(
            id,
            title,
            description,
            job_type,
            salary_min,
            salary_max,
            salary_type,
            exact_location,
            duration_days,
            status,
            created_at,
            posted_by:users!job_listings_posted_by_id_fkey(
              id,
              name,
              email
            )
          )
        `)
        .eq('user_id', userId)
        .in('status', ['SELECTED'])
        .order('updated_at', { ascending: false })
      if (error) throw error
      // Transform the data to match the ActiveJob interface
      const activeJobs: ActiveJob[] = (data || []).map((application) => {
        if (!application.job) {
          throw new Error('Job data missing from application')
        }
        
        return {
          assignmentId: application.id,
          jobId: application.job.id,
          title: application.job.title,
          company: application.job.posted_by?.name || 'Unknown Company',
          description: application.job.description,
          salary: undefined, // Legacy field - now optional
          salaryType: application.job.salary_type || undefined,
          salaryMin: application.job.salary_min || undefined,
          salaryMax: application.job.salary_max || undefined,
          agreedSalary: undefined, // Could be extracted from client_notes JSON if stored there
          startDate: undefined, // Could be extracted from client_notes or job start date
          startTime: undefined,
          duration: application.job.duration_days ? `${application.job.duration_days} days` : undefined,
          jobAddress: application.job.exact_location || undefined,
          contractStatus: application.status || 'PENDING',
          assignedAt: application.updated_at || '',
          appliedAt: application.applied_at || '',
          selectedAt: application.status === 'SELECTED' ? (application.updated_at || undefined) : undefined,
          applicationMessage: application.cover_letter || undefined,
          notes: application.client_notes || undefined,
          client: {
            id: application.job.posted_by?.id || '',
            name: application.job.posted_by?.name,
            email: application.job.posted_by?.email,
            companyName: application.job.posted_by?.name // Use name as company name fallback
          }
        }
      })
      return activeJobs
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
export function useAcceptTaskerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      acceptanceData 
    }: { 
      applicationId: string
      acceptanceData?: {
        agreedSalary?: number
        startDate?: string
        notes?: string
      }
    }) => {
      // Update application status to SELECTED/ACCEPTED
      const updateData: ApplicationUpdate = {
        status: 'SELECTED',
        client_notes: acceptanceData?.notes || null,
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
        .select(`
          *,
          job:job_listings!applications_job_id_fkey(
            id, title, posted_by_id,
            posted_by:users!job_listings_posted_by_id_fkey(name)
          ),
          user:users(id, name, email)
        `)
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Update caches
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.activeJobs(data.user_id!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.userApplications(data.user_id!) })
      
      // Invalidate the specific job's applications
      if (data.job) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.jobs.applications({ jobId: data.job.id }) 
        })
      }
    },
  })
}
/**
 * Query hook for fetching recommended jobs for a user
 * Uses job matching based on user preferences, applied jobs, and profile
 */
export function useRecommendedJobsQuery(userId?: string, limit: number = 10) {
  const { getCityByKey, getCategoryByKey } = useData()
  
  return useQuery({
    queryKey: queryKeys.jobs.recommended(userId, limit),
    queryFn: async () => {
      if (!userId) return []
      
      // For future use: could implement user preferences here
      // const { data: userProfile } = await supabase
      //   .from('users')
      //   .select('id, name, email')
      //   .eq('id', userId)
      //   .single()
      
      // Get jobs user has already applied to (to exclude them)
      const { data: userApplications } = await supabase
        .from('applications')
        .select('job_id')
        .eq('user_id', userId)
      
      const appliedJobIds = userApplications?.map((app: { job_id: string | null }) => app.job_id).filter(id => id !== null) || []
      
      // Build query for recommended jobs
      let query = supabase
        .from('job_listings')
        .select(`
          id,
          title,
          description,
          job_type,
          city_id,
          category_id,
          salary_amount,
          salary_type,
          salary_min,
          salary_max,
          requirements,
          benefits,
          exact_location,
          is_active,
          is_featured,
          posted_by_id,
          created_at,
          updated_at,
          application_deadline,
          contact_info,
          status,
          posted_by:users!job_listings_posted_by_id_fkey (
            id, name, email
          )
        `)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      // Exclude jobs user already applied to
      if (appliedJobIds.length > 0) {
        query = query.not('id', 'in', `(${appliedJobIds.join(',')})`)
      }
      
      const { data, error } = await query.limit(limit)
      
      if (error) {
        console.error('Error fetching recommended jobs:', error)
        throw new Error(error.message)
      }
      
      // Transform to match expected Job interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedJobs = (data || []).map((job: any) => {
        const cityData = getCityByKey(job.city_id || '')
        const categoryData = getCategoryByKey(job.category_id || '')
        
        return {
          id: job.id,
          title: job.title,
          company: job.posted_by?.name || 'Company',
          city_id: job.city_id || '',
          city: cityData ? {
            id: cityData.id,
            key: cityData.key,
            name_bs: cityData.name_bs,
            name_en: cityData.name_en,
            name: cityData.name,
            country: cityData.country || 'Bosnia and Herzegovina'
          } : undefined,
          category_id: job.category_id || '',
          category: categoryData ? {
            id: categoryData.id,
            key: categoryData.key,
            name_bs: categoryData.name_bs,
            name_en: categoryData.name_en,
            name: categoryData.name,
          } : undefined,
          type: job.job_type as 'quick_job' | 'full_time' | 'part_time' | 'remote',
          description: job.description,
          requirements: job.requirements || '',
          benefits: job.benefits || '',
          salary: job.salary_amount?.toString() || '',
          salaryAmount: job.salary_amount,
          salaryType: job.salary_type || undefined,
          salaryMin: job.salary_min || undefined,
          salaryMax: job.salary_max || undefined,
          email: '',
          website: '',
          phone: '',
          exactLocation: job.exact_location,
          isActive: job.is_active,
          isFeatured: job.is_featured,
          postedById: job.posted_by_id,
          createdAt: job.created_at || '',
          updatedAt: job.updated_at,
        }
      })
      
      return transformedJobs
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  })
}
/**
 * Query hook for fetching today's job posting count for a user
 * Used to enforce daily posting limits
 */
export function useTodayJobCountQuery(userId?: string) {
  return useQuery({
    queryKey: queryKeys.jobs.todayCount(userId),
    queryFn: async () => {
      if (!userId) return 0
      
      // Get start of today in user's timezone (assume UTC for now)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()
      
      const { count, error } = await supabase
        .from('job_listings')
        .select('id', { count: 'exact' })
        .eq('posted_by_id', userId)
        .gte('created_at', todayISO)
      
      if (error) {
        console.error('Error fetching today job count:', error)
        throw new Error(error.message)
      }
      
      return count || 0
    },
    staleTime: 30 * 1000, // 30 seconds - refresh frequently for accuracy
    enabled: !!userId,
  })
}
/**
 * Query hook for fetching application counts for multiple jobs
 * Used in client dashboard to show application counts for each job
 */
export function useMultipleJobApplicantCountsQuery(jobIds: string[]) {
  return useQuery({
    queryKey: queryKeys.jobs.applicantCounts(jobIds),
    queryFn: async () => {
      if (!jobIds.length) return {}
      
      // Get application counts for each job
      const { data, error } = await supabase
        .from('applications')
        .select('job_id')
        .in('job_id', jobIds)
        .not('status', 'eq', 'WITHDRAWN')
      
      if (error) {
        console.error('Error fetching application counts:', error)
        throw new Error(error.message)
      }
      
      // Count applications per job
      const counts: Record<string, number> = {}
      jobIds.forEach(id => counts[id] = 0) // Initialize all to 0
      
      data?.forEach(app => {
        if (app.job_id && counts.hasOwnProperty(app.job_id)) {
          counts[app.job_id]++
        }
      })
      
      return counts
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: jobIds.length > 0,
  })
}
