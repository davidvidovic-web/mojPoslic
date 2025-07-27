import type { JobFilters } from '@/types/job'
import type { QueryClient } from '@tanstack/react-query'

// Define filter types
export interface UserFilters {
  role?: string
  search?: string
  isActive?: boolean
}

export interface ApplicationFilters {
  status?: string[] | string
  jobId?: string
  userId?: string
  search?: string
  dateFrom?: Date | string
  dateTo?: Date | string
}

/**
 * Query keys factory for TanStack Query
 * Provides consistent and hierarchical query key structure
 */
export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.detail(id), 'profile'] as const,
    privacy: (id: string) => [...queryKeys.users.detail(id), 'privacy'] as const,
  },

  // Job-related queries
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: JobFilters) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    byUser: (userId?: string) => [...queryKeys.jobs.all, 'by-user', userId] as const,
    applications: (filters?: ApplicationFilters) => [...queryKeys.jobs.all, 'applications', filters] as const,
    application: (id: string) => [...queryKeys.jobs.all, 'application', id] as const,
    userApplications: (userId?: string) => [...queryKeys.jobs.all, 'user-applications', userId] as const,
    userAppliedJobs: (userId?: string) => [...queryKeys.jobs.all, 'user-applied-jobs', userId] as const,
    activeJobs: (userId?: string) => [...queryKeys.jobs.all, 'active-jobs', userId] as const,
    recommended: (userId?: string, limit?: number) => [...queryKeys.jobs.all, 'recommended', userId, limit] as const,
    todayCount: (userId?: string) => [...queryKeys.jobs.all, 'today-count', userId] as const,
    applicantCounts: (jobIds: string[]) => [...queryKeys.jobs.all, 'applicant-counts', jobIds] as const,
    views: (jobId: string) => [...queryKeys.jobs.detail(jobId), 'views'] as const,
    saved: (userId: string) => [...queryKeys.jobs.all, 'saved', userId] as const,
  },

  // Application queries
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters: ApplicationFilters) => [...queryKeys.applications.lists(), filters] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
    user: (userId: string) => [...queryKeys.applications.all, 'user', userId] as const,
    byJob: (jobId: string) => [...queryKeys.applications.all, 'job', jobId] as const,
  },

  // Messaging queries
  conversations: {
    all: ['conversations'] as const,
    lists: () => [...queryKeys.conversations.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.conversations.lists(), userId] as const,
    details: () => [...queryKeys.conversations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.conversations.details(), id] as const,
    messages: (conversationId: string) => [...queryKeys.conversations.detail(conversationId), 'messages'] as const,
    participants: (conversationId: string) => [...queryKeys.conversations.detail(conversationId), 'participants'] as const,
  },

  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.notifications.lists(), userId] as const,
    user: (userId: string) => [...queryKeys.notifications.lists(), userId] as const,
    unread: (userId: string) => [...queryKeys.notifications.all, 'unread', userId] as const,
    byType: (userId: string, type: string) => [...queryKeys.notifications.user(userId), 'type', type] as const,
    detail: (id: string) => [...queryKeys.notifications.all, 'detail', id] as const,
  },

  // Static data queries
  cities: {
    all: ['cities'] as const,
    active: () => [...queryKeys.cities.all, 'active'] as const,
  },

  categories: {
    all: ['categories'] as const,
    active: () => [...queryKeys.categories.all, 'active'] as const,
    popular: () => [...queryKeys.categories.all, 'popular'] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
  },

  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    jobs: () => [...queryKeys.analytics.all, 'jobs'] as const,
    users: () => [...queryKeys.analytics.all, 'users'] as const,
  },

  // Reviews queries
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.reviews.lists(), userId] as const,
    byUser: (userId: string) => [...queryKeys.reviews.all, 'user', userId] as const,
    byJob: (jobId: string) => [...queryKeys.reviews.all, 'job', jobId] as const,
  },

  // Payment queries
  payments: {
    all: ['payments'] as const,
    transactions: () => [...queryKeys.payments.all, 'transactions'] as const,
    userTransactions: (userId: string) => [...queryKeys.payments.transactions(), userId] as const,
    connections: () => [...queryKeys.payments.all, 'connections'] as const,
    userConnections: (userId: string) => [...queryKeys.payments.connections(), userId] as const,
  },
}

/**
 * Utility functions for cache management
 */
export const cacheUtils = {
  /**
   * Invalidate all queries for a specific entity
   */
  invalidateEntity: (queryClient: QueryClient, entity: keyof typeof queryKeys) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys[entity].all })
  },

  /**
   * Invalidate user-specific queries across all entities
   */
  invalidateUserQueries: (queryClient: QueryClient, userId: string) => {
    const userQueries = [
      queryKeys.applications.user(userId),
      queryKeys.notifications.user(userId),
      queryKeys.conversations.list(userId),
      queryKeys.reviews.byUser(userId),
      queryKeys.payments.userTransactions(userId),
      queryKeys.payments.userConnections(userId),
    ]

    userQueries.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey })
    })
  },

  /**
   * Invalidate job-related queries
   */
  invalidateJobQueries: (queryClient: QueryClient, jobId: string) => {
    const jobQueries = [
      queryKeys.jobs.detail(jobId),
      queryKeys.jobs.applications({ jobId }),
      queryKeys.jobs.views(jobId),
      queryKeys.applications.byJob(jobId),
      queryKeys.reviews.byJob(jobId),
    ]

    jobQueries.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey })
    })
  },

  /**
   * Get all query keys for debugging
   */
  getAllKeys: () => queryKeys,
}

export default queryKeys
