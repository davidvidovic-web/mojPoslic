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
import { getRoleDisplayName } from '@/lib/role-utils'
import { useUpdateUserRole, useDeleteUser, type AdminUser } from '@/hooks/use-admin'
import { useTranslations } from 'next-intl'

interface UserManagementTabProps {
  users: AdminUser[]
  currentUserId?: string
}

export function UserManagementTab({ users, currentUserId }: UserManagementTabProps) {
  const t = useTranslations('admin.userManagement')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userPage, setUserPage] = useState(1)
  const itemsPerPage = 10

  // TanStack Query mutations
  const updateUserRoleMutation = useUpdateUserRole()
  const deleteUserMutation = useDeleteUser()

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    // First validate that the role is one of the valid options
    const validRoles = ['admin', 'client', 'tasker', 'company']
    if (!validRoles.includes(newRole)) {
      console.error('Invalid role selected:', newRole)
      return
    }
    
    updateUserRoleMutation.mutate({ userId, role: newRole })
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('confirmDelete'))) return
    deleteUserMutation.mutate(userId)
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
        <div className="space-y-4">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {t('title')}
          </CardTitle>
          
          {/* Mobile-responsive filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchUsers')}
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={userRoleFilter}
              onValueChange={setUserRoleFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('filterByRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRoles')}</SelectItem>
                <SelectItem value="admin">{t('admins')}</SelectItem>
                <SelectItem value="client">{t('clients')}</SelectItem>
                <SelectItem value="tasker">{t('taskers')}</SelectItem>
                <SelectItem value="company">{t('companies')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedUsers.map((user) => (
            <div key={user.id} className="border rounded-lg p-4">
              {/* Mobile-friendly layout */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* User info */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-muted border flex items-center justify-center font-semibold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold truncate">{user.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('joined')} {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                
                {/* Actions - stacked on mobile, inline on desktop */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center w-fit">
                    {getRoleIcon(user.role)}
                    <span className="ml-1">{getRoleDisplayName(user.role as 'admin' | 'client' | 'tasker' | 'company')}</span>
                  </Badge>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                      value={user.role}
                      onValueChange={(value) => {
                        handleUpdateUserRole(user.id, value)
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-32">
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
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
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

// Add default export
export default UserManagementTab
