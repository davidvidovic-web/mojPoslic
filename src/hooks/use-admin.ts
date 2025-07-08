/**
 * TanStack Query hooks for admin data management
 * Handles users, jobs, stats, and system management data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'client' | 'tasker' | 'company'
  companyName?: string
  createdAt: string
  _count: {
    postedJobs: number
  }
}

interface AdminJob {
  id: string
  title: string
  company: string
  description: string
  type: string
  salary?: string
  transportation?: string
  transportation_amount?: number
  email: string
  website?: string
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  city?: {
    id: string
    name: string
    name_en: string
    name_bs: string
  }
  category?: {
    id: string
    name: string
    name_en: string
    name_bs: string
  }
  postedBy: {
    id: string
    name: string
    email: string
    companyName?: string
  }
}

interface AdminStats {
  totalUsers: number
  totalJobs: number
  totalActiveJobs: number
  totalFeaturedJobs: number
  totalCategories: number
  totalCities: number
  monthlySignups: number
  monthlyJobPosts: number
}

interface AdminCategory {
  id: string
  key: string
  name_en: string
  name_bs: string
  is_active: boolean
  sort_order: number
}

interface AdminCity {
  id: string
  key: string
  name_en: string
  name_bs: string
  is_active: boolean
  sort_order: number
}

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  jobs: () => [...adminKeys.all, 'jobs'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  categories: () => [...adminKeys.all, 'categories'] as const,
  cities: () => [...adminKeys.all, 'cities'] as const,
}

// API Functions
async function fetchUsers(): Promise<AdminUser[]> {
  const response = await fetch('/api/admin/users')
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

async function fetchJobs(): Promise<AdminJob[]> {
  const response = await fetch('/api/admin/jobs')
  if (!response.ok) throw new Error('Failed to fetch admin jobs')
  return response.json()
}

async function fetchStats(): Promise<AdminStats> {
  const response = await fetch('/api/admin/stats')
  if (!response.ok) throw new Error('Failed to fetch admin stats')
  return response.json()
}

async function fetchCategories(): Promise<AdminCategory[]> {
  const response = await fetch('/api/admin/categories')
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

async function fetchCities(): Promise<AdminCity[]> {
  const response = await fetch('/api/admin/cities')
  if (!response.ok) throw new Error('Failed to fetch cities')
  return response.json()
}

async function deleteJob(jobId: string): Promise<void> {
  const response = await fetch('/api/admin/jobs', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId }),
  })
  if (!response.ok) throw new Error('Failed to delete job')
}

async function updateJobStatus(jobId: string, isActive: boolean): Promise<void> {
  const response = await fetch('/api/admin/jobs', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, isActive }),
  })
  if (!response.ok) throw new Error('Failed to update job status')
}

async function updateJobFeatured(jobId: string, isFeatured: boolean): Promise<void> {
  const response = await fetch('/api/admin/jobs', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, isFeatured }),
  })
  if (!response.ok) throw new Error('Failed to update featured status')
}

async function updateUserRole(userId: string, role: string): Promise<void> {
  const response = await fetch('/api/admin/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update user role')
  }
}

async function deleteUser(userId: string): Promise<void> {
  const response = await fetch('/api/admin/users', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!response.ok) throw new Error('Failed to delete user')
}

// Query Hooks
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: fetchUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAdminJobs() {
  return useQuery({
    queryKey: adminKeys.jobs(),
    queryFn: fetchJobs,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: adminKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useAdminCities() {
  return useQuery({
    queryKey: adminKeys.cities(),
    queryFn: fetchCities,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Mutation Hooks
export function useDeleteAdminJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jobs() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      toast.success('Job deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete job')
      console.error('Job deletion error:', error)
    },
  })
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ jobId, isActive }: { jobId: string; isActive: boolean }) =>
      updateJobStatus(jobId, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jobs() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      toast.success(`Job ${isActive ? 'activated' : 'deactivated'} successfully`)
    },
    onError: (error) => {
      toast.error('Failed to update job status')
      console.error('Job status update error:', error)
    },
  })
}

export function useUpdateJobFeatured() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ jobId, isFeatured }: { jobId: string; isFeatured: boolean }) =>
      updateJobFeatured(jobId, isFeatured),
    onSuccess: (_, { isFeatured }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jobs() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      toast.success(`Job ${isFeatured ? 'featured' : 'unfeatured'} successfully`)
    },
    onError: (error) => {
      toast.error('Failed to update featured status')
      console.error('Job featured update error:', error)
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      toast.success('User role updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user role')
      console.error('User role update error:', error)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete user')
      console.error('User deletion error:', error)
    },
  })
}

// Export types for use in components
export type { AdminUser, AdminJob, AdminStats, AdminCategory, AdminCity }
