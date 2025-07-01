'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { 
  Users, 
  Search, 
  Trash2, 
  Building,
  Building2,
  User,
  Crown
} from 'lucide-react'
import { toast } from 'sonner'
import { getRoleDisplayName } from '@/lib/role-utils'

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

interface UserManagementTabProps {
  users: AdminUser[]
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>
  currentUserId?: string
}

export function UserManagementTab({ users, setUsers, currentUserId }: UserManagementTabProps) {
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userPage, setUserPage] = useState(1)
  const itemsPerPage = 10

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('Updating user role on client side:', { userId, newRole })
      
      // First validate that the role is one of the valid options
      const validRoles = ['admin', 'client', 'tasker', 'company']
      if (!validRoles.includes(newRole)) {
        console.error('Invalid role selected:', newRole)
        toast.error(`Invalid role: ${newRole}`)
        return
      }
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })
      
      console.log('Update role response status:', response.status)
      
      const responseData = await response.json()
      console.log('Response data:', responseData)
      
      if (!response.ok) {
        console.error('Error response data:', responseData)
        throw new Error(responseData.error || responseData.details || 'Failed to update user role')
      }
      
      console.log('Updated user data from server:', responseData)

      // Update the UI with the new role
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId 
          ? { ...u, role: newRole as 'admin' | 'client' | 'tasker' | 'company' } 
          : u
        )
      )
      
      toast.success('User role updated successfully')
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update user role')
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />
      case 'client': return <Building className="h-4 w-4" />
      case 'tasker': return <User className="h-4 w-4" />
      case 'company': return <Building2 className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'client': return 'default'
      case 'company': return 'default'
      case 'tasker': return 'secondary'
      default: return 'outline'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter
    return matchesSearch && matchesRole
  })

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  )

  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select
              value={userRoleFilter}
              onValueChange={setUserRoleFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="tasker">Taskers</SelectItem>
                <SelectItem value="company">Companies</SelectItem>
              </SelectContent>
            </Select>
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
                  <span className="ml-1">{getRoleDisplayName(user.role as 'admin' | 'client' | 'tasker' | 'company')}</span>
                </Badge>
                <Select
                  value={user.role}
                  onValueChange={(value) => {
                    console.log('Select onValueChange triggered with value:', value)
                    handleUpdateUserRole(user.id, value)
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="tasker">Tasker</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.id === currentUserId} // Can't delete own account
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
  )
}
