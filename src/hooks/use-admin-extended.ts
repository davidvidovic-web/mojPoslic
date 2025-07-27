/**
 * TanStack Query hooks for admin functionality
 * Replaces manual fetch() calls in admin components  
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
interface BillingStats {
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  activeUsers: number
}

interface StripeTransaction {
  id: string
  userId: string
  amount: number
  currency: string
  status: string
  connectionsPurchased: number
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

interface AdminConnectionHistory {
  id: string
  userId: string
  action: string
  connectionsBefore: number
  connectionsAfter: number
  amountChanged: number
  reason?: string
  createdAt: string
  adminId?: string
  user?: {
    name: string
    email: string
  }
}

interface ConnectionGrantData {
  userId: string
  amount: number
  reason: string
}

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  billing: () => [...adminKeys.all, 'billing'] as const,
  billingStats: () => [...adminKeys.billing(), 'stats'] as const,
  transactions: () => [...adminKeys.billing(), 'transactions'] as const,
  connections: () => [...adminKeys.all, 'connections'] as const,
  connectionHistory: () => [...adminKeys.connections(), 'history'] as const,
}

// API Functions
async function fetchBillingStats(): Promise<BillingStats> {
  const response = await fetch('/api/admin/billing/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch billing statistics')
  }
  return response.json()
}

async function fetchTransactions(): Promise<StripeTransaction[]> {
  const response = await fetch('/api/admin/billing/transactions')
  if (!response.ok) {
    throw new Error('Failed to fetch transactions')
  }
  const data = await response.json()
  return data.transactions || []
}

async function fetchConnectionHistory(): Promise<AdminConnectionHistory[]> {
  const response = await fetch('/api/admin/connection-history')
  if (!response.ok) {
    throw new Error('Failed to fetch connection history')
  }
  const data = await response.json()
  return data || []
}

async function grantConnections(data: ConnectionGrantData): Promise<void> {
  const response = await fetch('/api/admin/connections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to grant connections')
  }
}

// Query Hooks
export function useAdminBillingStats() {
  return useQuery({
    queryKey: adminKeys.billingStats(),
    queryFn: fetchBillingStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAdminTransactions() {
  return useQuery({
    queryKey: adminKeys.transactions(),
    queryFn: fetchTransactions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAdminConnectionHistory() {
  return useQuery({
    queryKey: adminKeys.connectionHistory(),
    queryFn: fetchConnectionHistory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Mutation Hooks
export function useGrantConnections() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: grantConnections,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminKeys.connectionHistory() })
      queryClient.invalidateQueries({ queryKey: adminKeys.billingStats() })
      
      toast.success('Connections granted successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to grant connections: ${error.message}`)
    },
  })
}

// Combined hooks for admin management
export function useAdminBillingManager() {
  const statsQuery = useAdminBillingStats()
  const transactionsQuery = useAdminTransactions()

  return {
    // Billing data
    stats: statsQuery.data,
    transactions: transactionsQuery.data || [],
    
    // Query states
    isLoadingStats: statsQuery.isLoading,
    isLoadingTransactions: transactionsQuery.isLoading,
    isLoading: statsQuery.isLoading || transactionsQuery.isLoading,
    isError: statsQuery.isError || transactionsQuery.isError,
    error: statsQuery.error || transactionsQuery.error,
    
    // Utility functions
    refetchStats: statsQuery.refetch,
    refetchTransactions: transactionsQuery.refetch,
    refetchAll: () => {
      statsQuery.refetch()
      transactionsQuery.refetch()
    },
  }
}

export function useAdminConnectionsManager() {
  const historyQuery = useAdminConnectionHistory()
  const grantMutation = useGrantConnections()

  return {
    // Connection history data
    history: historyQuery.data || [],
    
    // Query states
    isLoadingHistory: historyQuery.isLoading,
    isError: historyQuery.isError,
    error: historyQuery.error,
    
    // Mutations
    grantConnections: grantMutation.mutate,
    isGranting: grantMutation.isPending,
    
    // Utility functions
    refetchHistory: historyQuery.refetch,
  }
}
