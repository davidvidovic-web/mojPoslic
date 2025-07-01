'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'
import { AdminStatsCards } from './admin/admin-stats-cards'
import { UserManagementTab } from './admin/user-management-tab'
import { JobManagementTab } from './admin/job-management-tab'
import { SystemManagementTab } from './admin/system-management-tab'

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

interface AdminJobType {
  key: string
  nameEN: string
  nameBS: string
  description: string
  isPopular: boolean
  sortOrder: number
  jobCount: number
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
  const [jobTypes, setJobTypes] = useState<AdminJobType[]>([])

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

  const fetchJobTypes = async () => {
    try {
      const response = await fetch('/api/admin/types')
      if (!response.ok) {
        throw new Error('Failed to fetch job types')
      }
      const data = await response.json()
      setJobTypes(data)
    } catch (error) {
      console.error('Error fetching job types:', error)
      toast.error('Failed to load job types')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUsers(), 
        fetchJobs(), 
        fetchStats(),
        fetchCategories(),
        fetchCities(),
        fetchJobTypes()
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name}! Manage users and jobs across the platform.
          </p>
        </div>

        {/* Stats Cards */}
        <AdminStatsCards stats={stats} />

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="system">System Management</TabsTrigger>
          </TabsList>

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
              jobTypes={jobTypes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
