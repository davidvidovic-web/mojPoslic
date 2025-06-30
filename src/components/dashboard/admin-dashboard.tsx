'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { 
  Users, 
  Briefcase, 
  Shield, 
  TrendingUp, 
  Search, 
  Trash2, 
  Building,
  User,
  Crown,
  Eye,
  EyeOff,
  Star,
  Car
} from 'lucide-react'
import { toast } from 'sonner'
import { formatJobType, formatTransportation } from '@/lib/job-utils'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'employer' | 'employee' | 'company'
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
    employer: number
    employee: number
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
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [jobSearchTerm, setJobSearchTerm] = useState('')
  
  // Pagination state
  const [userPage, setUserPage] = useState(1)
  const [jobPage, setJobPage] = useState(1)
  const [categoryPage, setCategoryPage] = useState(1)
  const [cityPage, setCityPage] = useState(1)
  const itemsPerPage = 10
  
  // System management state
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [cities, setCities] = useState<AdminCity[]>([])
  const [jobTypes, setJobTypes] = useState<AdminJobType[]>([])
  const [systemActiveTab, setSystemActiveTab] = useState('categories')

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

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'admin' | 'employer' | 'employee' | 'company' } : u))
      toast.success('User role updated successfully')
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete job')
      }

      setJobs(jobs.filter(job => job.id !== jobId))
      toast.success('Job deleted successfully')
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      setUsers(users.filter(u => u.id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleToggleJobStatus = async (jobId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update job status')
      }

      setJobs(jobs.map(job => job.id === jobId ? { ...job, isActive } : job))
      toast.success(`Job ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job status')
    }
  }

  const handleToggleJobFeatured = async (jobId: string, isFeatured: boolean) => {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, isFeatured }),
      })

      if (!response.ok) {
        throw new Error('Failed to update featured status')
      }

      setJobs(jobs.map(job => job.id === jobId ? { ...job, isFeatured } : job))
      toast.success(`Job ${isFeatured ? 'featured' : 'unfeatured'} successfully`)
    } catch (error) {
      console.error('Error updating featured status:', error)
      toast.error('Failed to update featured status')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />
      case 'employer': return <Building className="h-4 w-4" />
      case 'employee': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'employer': return 'default'
      case 'company': return 'default'
      case 'employee': return 'secondary'
      default: return 'outline'
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  )

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(jobSearchTerm.toLowerCase())
  )

  // Pagination logic
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  )
  
  const paginatedJobs = filteredJobs.slice(
    (jobPage - 1) * itemsPerPage,
    jobPage * itemsPerPage
  )
  
  const paginatedCategories = categories.slice(
    (categoryPage - 1) * itemsPerPage,
    categoryPage * itemsPerPage
  )
  
  const paginatedCities = cities.slice(
    (cityPage - 1) * itemsPerPage,
    cityPage * itemsPerPage
  )

  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const totalJobPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const totalCategoryPages = Math.ceil(categories.length / itemsPerPage)
  const totalCityPages = Math.ceil(cities.length / itemsPerPage)

  const userStats = {
    total: stats?.users.total || 0,
    admins: stats?.users.admin || 0,
    employers: stats?.users.employer || 0,
    employees: stats?.users.employee || 0,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employers</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.employers}</div>
              <p className="text-xs text-muted-foreground">Posting jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.jobs.total || 0}</div>
              <p className="text-xs text-muted-foreground">Job postings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.growth.percentage !== undefined 
                  ? `${stats.growth.percentage > 0 ? '+' : ''}${stats.growth.percentage}%` 
                  : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="system">System Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Management
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-muted border flex items-center justify-center font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </Badge>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="employer">Employer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === user?.id} // Can't delete own account
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Pagination
                  currentPage={userPage}
                  totalPages={totalUserPages}
                  onPageChange={setUserPage}
                  className="mt-6"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Job Management
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search jobs..."
                      value={jobSearchTerm}
                      onChange={(e) => setJobSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{job.title}</h4>
                          <Badge variant="secondary">{formatJobType(job.type)}</Badge>
                          {job.transportation && (
                            <Badge variant="outline" className="text-xs">
                              <Car className="h-3 w-3 mr-1" />
                              {formatTransportation(job.transportation, job.transportation_amount)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.city?.name || 'Remote'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={job.isActive ? "default" : "secondary"}>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {job.isFeatured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Posted {formatDate(job.createdAt)}</span>
                          {job.postedBy && (
                            <span> • by {job.postedBy.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={job.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleJobStatus(job.id, !job.isActive)}
                        >
                          {job.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant={job.isFeatured ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleJobFeatured(job.id, !job.isFeatured)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Pagination
                  currentPage={jobPage}
                  totalPages={totalJobPages}
                  onPageChange={setJobPage}
                  className="mt-6"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    System Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={systemActiveTab} onValueChange={setSystemActiveTab} className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="categories">Categories</TabsTrigger>
                      <TabsTrigger value="cities">Cities</TabsTrigger>
                      <TabsTrigger value="types">Job Types</TabsTrigger>
                    </TabsList>

                    <TabsContent value="categories">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Category Management</h3>
                          <Button onClick={() => {/* TODO: Add create category modal */}}>
                            Add Category
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {paginatedCategories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{category.nameEN}</h4>
                                  <span className="text-sm text-muted-foreground">({category.nameBS})</span>
                                  {category.isPopular && <Badge variant="default" className="text-xs">Popular</Badge>}
                                  {!category.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">Key: {category.key}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Pagination
                          currentPage={categoryPage}
                          totalPages={totalCategoryPages}
                          onPageChange={setCategoryPage}
                          className="mt-6"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="cities">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">City Management</h3>
                          <Button onClick={() => {/* TODO: Add create city modal */}}>
                            Add City
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {paginatedCities.map((city) => (
                            <div key={city.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{city.nameEN}</h4>
                                  <span className="text-sm text-muted-foreground">({city.nameBS})</span>
                                  {city.isSpecial && <Badge variant="default" className="text-xs">Special</Badge>}
                                  {!city.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">Key: {city.key}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Pagination
                          currentPage={cityPage}
                          totalPages={totalCityPages}
                          onPageChange={setCityPage}
                          className="mt-6"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="types">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Job Type Management</h3>
                          <p className="text-sm text-muted-foreground">Job types are predefined enum values and cannot be modified.</p>
                        </div>
                        <div className="space-y-2">
                          {jobTypes.map((type) => (
                            <div key={type.key} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{type.nameEN}</h4>
                                  <span className="text-sm text-muted-foreground">({type.nameBS})</span>
                                  {type.isPopular && <Badge variant="default" className="text-xs">Popular</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                                <p className="text-xs text-muted-foreground">Jobs using this type: {type.jobCount}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
