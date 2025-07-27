'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminConnectionsManager } from '@/hooks/use-admin-extended'
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Search,
  RefreshCw,
  AlertTriangle,
  Link,
  Clock
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ConnectionManagementTabProps {
  className?: string
}

export function ConnectionManagementTabMigrated({ className }: ConnectionManagementTabProps) {
  const t = useTranslations('admin.connections')
  const [activeTab, setActiveTab] = useState('overview')
  const [connectionSearchTerm, setConnectionSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Use Supabase hooks instead of manual fetch() calls
  const { 
    history,
    isLoadingHistory: isLoading,
    isError,
    error,
    refetchHistory 
  } = useAdminConnectionsManager()

  // Map history to connections format with status based on action
  const connections = (history || []).map(item => ({
    ...item,
    status: item.amountChanged > 0 ? 'active' : item.amountChanged < 0 ? 'expired' : 'pending',
    amount: Math.abs(item.amountChanged),
    currency: 'BAM'
  }))

  const stats = {
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.status === 'active').length,
    totalRevenue: connections.reduce((sum, c) => sum + (c.amount || 0), 0),
    monthlyRevenue: connections
      .filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, c) => sum + (c.amount || 0), 0)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'expired':
      case 'inactive':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'expired':
      case 'inactive':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'BAM') => {
    return new Intl.NumberFormat('bs-BA', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter connections based on search term and action (instead of status)
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connectionSearchTerm === '' || 
      connection.user?.name?.toLowerCase().includes(connectionSearchTerm.toLowerCase()) ||
      connection.user?.email?.toLowerCase().includes(connectionSearchTerm.toLowerCase()) ||
      connection.id.toLowerCase().includes(connectionSearchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      connection.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredConnections.length / itemsPerPage)
  const paginatedConnections = filteredConnections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleRefresh = () => {
    refetchHistory()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('retry')}
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>{t('errors.failedToLoadData')}</p>
              <p className="text-sm text-gray-500 mt-1">{error?.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="connections">{t('tabs.connections')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('stats.totalConnections')}</p>
                    <p className="text-2xl font-bold">{stats?.totalConnections || 0}</p>
                  </div>
                  <Link className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('stats.activeConnections')}</p>
                    <p className="text-2xl font-bold">{stats?.activeConnections || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('stats.totalRevenue')}</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('stats.monthlyRevenue')}</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('search.placeholder')}
                value={connectionSearchTerm}
                onChange={(e) => setConnectionSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('filters.active')}</SelectItem>
                <SelectItem value="pending">{t('filters.pending')}</SelectItem>
                <SelectItem value="expired">{t('filters.expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Connections List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                {t('connections.title')} ({filteredConnections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paginatedConnections.length === 0 ? (
                <div className="text-center py-8">
                  <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('connections.noConnections')}</h3>
                  <p className="text-gray-600">{t('connections.noConnectionsDescription')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Link className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{connection.user?.name || t('unknown')}</p>
                          <p className="text-sm text-muted-foreground">{connection.user?.email}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(connection.createdAt)}</span>
                            <span>•</span>
                            <span>{connection.action}</span>
                            {connection.reason && (
                              <>
                                <span>•</span>
                                <span>{connection.reason}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {connection.amount && (
                          <p className="font-medium">{formatCurrency(connection.amount, connection.currency)}</p>
                        )}
                        <Badge variant={getStatusBadgeVariant(connection.status)} className={getStatusColor(connection.status)}>
                          {connection.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
