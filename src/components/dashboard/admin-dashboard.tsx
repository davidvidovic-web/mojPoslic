'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'
import { AdminStatsCards } from './admin/admin-stats-cards'
import { UserManagementTab } from './admin/user-management-tab'
import { JobManagementTab } from './admin/job-management-tab'
import { SystemManagementTab } from './admin/system-management-tab'
import { BillingManagementTab } from './admin/billing-management-tab'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'

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
  users: {
    total: number
    admin: number
    client: number
    tasker: number
    company: number
  }
  jobs: {
    total: number
    active: number
    featured: number
  }
  growth: {
    percentage: number
    recentUsers: number
    previousUsers: number
  }
}

interface AdminCategory {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isPopular: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface AdminCity {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isSpecial: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // System management state
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [cities, setCities] = useState<AdminCity[]>([])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to load jobs')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/admin/cities')
      if (!response.ok) {
        throw new Error('Failed to fetch cities')
      }
      const data = await response.json()
      setCities(data)
    } catch (error) {
      console.error('Error fetching cities:', error)
      toast.error('Failed to load cities')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUsers(), 
        fetchJobs(), 
        fetchStats(),
        fetchCategories(),
        fetchCities()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>!
          </p>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          {/* Mobile: Dropdown-style tabs */}
          <div className="block sm:hidden">
            <TabsList className="w-full grid grid-cols-1 h-auto p-1 bg-muted">
              <div className="grid grid-cols-2 gap-1">
                <TabsTrigger value="users" className="text-xs px-2 py-2">
                  Users
                </TabsTrigger>
                <TabsTrigger value="jobs" className="text-xs px-2 py-2">
                  Jobs
                </TabsTrigger>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <TabsTrigger value="system" className="text-xs px-2 py-2">
                  System
                </TabsTrigger>
                <TabsTrigger value="billing" className="text-xs px-2 py-2">
                  Billing
                </TabsTrigger>
                <TabsTrigger value="statistics" className="text-xs px-2 py-2">
                  Statistics
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
          
          {/* Desktop: Horizontal tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="jobs">Job Management</TabsTrigger>
              <TabsTrigger value="system">System Management</TabsTrigger>
              <TabsTrigger value="billing">Billing Management</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users">
            <UserManagementTab 
              users={users} 
              setUsers={setUsers} 
              currentUserId={user?.id}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <JobManagementTab 
              jobs={jobs} 
              setJobs={setJobs} 
            />
          </TabsContent>

          <TabsContent value="system">
            <SystemManagementTab 
              categories={categories}
              cities={cities}
            />
          </TabsContent>

          <TabsContent value="billing">
            <BillingManagementTab />
          </TabsContent>

          <TabsContent value="statistics">
            <AdminStatsCards stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
