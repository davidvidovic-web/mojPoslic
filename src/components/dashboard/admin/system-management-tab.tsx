'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { Shield, Users, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import ConnectionGrantHistory from './connection-grant-history'

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

interface ConnectionUser {
  id: string
  email: string
  name: string
  role: string
  connections: number
  companyName?: string
}

interface SystemManagementTabProps {
  categories: AdminCategory[]
  cities: AdminCity[]
}

export function SystemManagementTab({ categories, cities }: SystemManagementTabProps) {
  const t = useTranslations('admin.system')
  const td = useTranslations('dashboard')
  const [systemActiveTab, setSystemActiveTab] = useState('categories')
  const [connectionUsers, setConnectionUsers] = useState<ConnectionUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [connectionAmount, setConnectionAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loadingConnections, setLoadingConnections] = useState(false)
  const [grantingConnections, setGrantingConnections] = useState(false)
  const [categoryPage, setCategoryPage] = useState(1)
  const [cityPage, setCityPage] = useState(1)
  const itemsPerPage = 10

  // Load users for connections management
  useEffect(() => {
    if (systemActiveTab === 'connections') {
      fetchUsersForConnections()
    }
  }, [systemActiveTab])

  const fetchUsersForConnections = async () => {
    setLoadingConnections(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const users = await response.json()
        setConnectionUsers(users.data || users)
      } else {
        toast.error(td('toast.usersLoadFailed'))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error(td('toast.usersLoadFailed'))
    } finally {
      setLoadingConnections(false)
    }
  }

  const handleGrantConnections = async () => {
    if (!selectedUserId || !connectionAmount || isNaN(Number(connectionAmount))) {
      toast.error(td('toast.selectUserAndAmount'))
      return
    }

    setGrantingConnections(true)
    try {
      const response = await fetch('/api/admin/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: parseInt(connectionAmount),
          reason: reason || 'Admin grant'
        }),
      })

      if (response.ok) {
        toast.success(td('toast.connectionsGranted'))
        setSelectedUserId('')
        setConnectionAmount('')
        setReason('')
        // Refresh user list
        fetchUsersForConnections()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || td('toast.connectionsGrantFailed'))
      }
    } catch (error) {
      console.error('Error granting connections:', error)
      toast.error(td('toast.connectionsGrantFailed'))
    } finally {
      setGrantingConnections(false)
    }
  }

  const paginatedCategories = categories.slice(
    (categoryPage - 1) * itemsPerPage,
    categoryPage * itemsPerPage
  )
  
  const paginatedCities = cities.slice(
    (cityPage - 1) * itemsPerPage,
    cityPage * itemsPerPage
  )

  const totalCategoryPages = Math.ceil(categories.length / itemsPerPage)
  const totalCityPages = Math.ceil(cities.length / itemsPerPage)

  return (
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
            {/* Mobile-responsive tabs */}
            <div className="block sm:hidden">
              <TabsList className="w-full grid grid-cols-2 h-auto p-1 bg-muted">
                <div className="grid grid-cols-2 gap-1">
                  <TabsTrigger value="categories" className="text-xs px-2 py-2">
                    Categories
                  </TabsTrigger>
                  <TabsTrigger value="cities" className="text-xs px-2 py-2">
                    Cities
                  </TabsTrigger>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <TabsTrigger value="connections" className="text-xs px-2 py-2">
                    Connections
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs px-2 py-2">
                    History
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>
            
            {/* Desktop tabs */}
            <div className="hidden sm:block">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="cities">Cities</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
                <TabsTrigger value="history">Connection History</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="categories">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">Category Management</h3>
                  <Button onClick={() => {/* TODO: Add create category modal */}} className="w-full sm:w-auto">
                    Add Category
                  </Button>
                </div>
                <div className="space-y-2">
                  {paginatedCategories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-medium truncate">{category.nameEN}</h4>
                            <span className="text-sm text-muted-foreground">({category.nameBS})</span>
                            {category.isPopular && <Badge variant="default" className="text-xs">Popular</Badge>}
                            {!category.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">Key: {category.key}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive flex-1 sm:flex-none">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
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
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
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

            <TabsContent value="connections">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Connection Management</h3>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      Grant connections to users
                    </span>
                  </div>
                </div>

                {/* Grant Connections Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Grant Connections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-select">Select User</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user..." />
                          </SelectTrigger>
                          <SelectContent>
                            {connectionUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex flex-col">
                                  <span>{user.name || user.email}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.role} • {user.connections} connections
                                    {user.companyName && ` • ${user.companyName}`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="connection-amount">Connection Amount</Label>
                        <Input
                          id="connection-amount"
                          type="number"
                          min="1"
                          value={connectionAmount}
                          onChange={(e) => setConnectionAmount(e.target.value)}
                          placeholder="Number of connections"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (Optional)</Label>
                      <Input
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for granting connections..."
                      />
                    </div>
                    <Button 
                      onClick={handleGrantConnections}
                      disabled={grantingConnections || !selectedUserId || !connectionAmount}
                      className="w-full"
                    >
                      {grantingConnections ? 'Granting...' : 'Grant Connections'}
                    </Button>
                  </CardContent>
                </Card>

                {/* User List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">User Connections</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchUsersForConnections}
                      disabled={loadingConnections}
                    >
                      {loadingConnections ? t('loading') : t('refresh')}
                    </Button>
                  </div>
                  
                  {loadingConnections ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">{t('loadingUsers')}</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connectionUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{user.name || 'Unknown'}</h4>
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                              <span className="text-sm font-medium text-primary">
                                {user.connections} connections
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.companyName && (
                              <p className="text-xs text-muted-foreground">Company: {user.companyName}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {connectionUsers.length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-muted-foreground">{t('noUsersFound')}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <ConnectionGrantHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Add default export
export default SystemManagementTab
