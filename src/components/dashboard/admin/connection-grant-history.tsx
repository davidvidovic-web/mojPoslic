'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { History, Search, Filter, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface ConnectionHistoryEntry {
  id: string
  userId: string
  action: string
  amount: number
  description: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface ConnectionGrantHistoryProps {
  className?: string
}

export function ConnectionGrantHistory({ className }: ConnectionGrantHistoryProps) {
  const td = useTranslations('dashboard')
  const [history, setHistory] = useState<ConnectionHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchConnectionHistory()
  }, [])

  const fetchConnectionHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/connection-history')
      if (!response.ok) {
        throw new Error('Failed to fetch connection history')
      }
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('Error fetching connection history:', error)
      toast.error(td('toast.connectionHistoryLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'ADMIN_ADJUSTMENT':
        return 'default'
      case 'PURCHASE':
        return 'secondary'
      case 'JOB_POST_CLIENT':
      case 'JOB_POST_COMPANY':
        return 'destructive'
      case 'JOB_APPLICATION':
        return 'outline'
      case 'MONTHLY_REFRESH':
        return 'default'
      case 'INITIAL_SIGNUP':
        return 'secondary'
      case 'ROLE_CHANGE':
        return 'default'
      default:
        return 'outline'
    }
  }

  const getActionDisplayName = (action: string) => {
    switch (action) {
      case 'ADMIN_ADJUSTMENT':
        return 'Admin Grant'
      case 'PURCHASE':
        return 'Purchase'
      case 'JOB_POST_CLIENT':
        return 'Job Post (Client)'
      case 'JOB_POST_COMPANY':
        return 'Job Post (Company)'
      case 'JOB_APPLICATION':
        return 'Job Application'
      case 'MONTHLY_REFRESH':
        return 'Monthly Refresh'
      case 'INITIAL_SIGNUP':
        return 'Initial Signup'
      case 'ROLE_CHANGE':
        return 'Role Change'
      default:
        return action
    }
  }

  const filteredHistory = history
    .filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesAction = actionFilter === 'all' || entry.action === actionFilter
      
      return matchesSearch && matchesAction
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return amount > 0 ? `+${amount}` : amount.toString()
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Connection History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              {/* Hardcoded in Bosnian - admin component without translation setup */}
              <p className="text-muted-foreground">Učitavanje historije konekcija...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-5 w-5 mr-2" />
          Connection History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="ADMIN_ADJUSTMENT">Admin Grants</SelectItem>
              <SelectItem value="PURCHASE">Purchases</SelectItem>
              <SelectItem value="JOB_POST_CLIENT">Job Posts (Client)</SelectItem>
              <SelectItem value="JOB_POST_COMPANY">Job Posts (Company)</SelectItem>
              <SelectItem value="JOB_APPLICATION">Applications</SelectItem>
              <SelectItem value="MONTHLY_REFRESH">Monthly Refresh</SelectItem>
              <SelectItem value="INITIAL_SIGNUP">Initial Signup</SelectItem>
              <SelectItem value="ROLE_CHANGE">Role Change</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="whitespace-nowrap"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>

        {/* History List */}
        <div className="space-y-2">
          {paginatedHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No history found</h3>
              <p className="text-muted-foreground">
                {searchTerm || actionFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'No connection history available yet'
                }
              </p>
            </div>
          ) : (
            paginatedHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-[var(--radius)]">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{entry.user.name || 'Unknown User'}</h4>
                    <Badge variant="outline" className="text-xs">
                      {entry.user.role}
                    </Badge>
                    <Badge variant={getActionBadgeVariant(entry.action)} className="text-xs">
                      {getActionDisplayName(entry.action)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{entry.user.email}</p>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    entry.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatAmount(entry.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">connections</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-6"
          />
        )}

        {/* Summary */}
        <div className="text-sm text-muted-foreground text-center pt-4 border-t">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHistory.length)} of {filteredHistory.length} entries
        </div>
      </CardContent>
    </Card>
  )
}

// Add default export
export default ConnectionGrantHistory
