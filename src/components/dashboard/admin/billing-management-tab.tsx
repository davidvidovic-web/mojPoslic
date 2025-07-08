'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Search,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentStats {
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  averageTransactionValue: number
  topPayingUsers: Array<{
    userId: string
    userName: string
    userEmail: string
    totalSpent: number
    transactionCount: number
  }>
}

interface StripeTransaction {
  id: string
  stripePaymentIntentId: string
  userId: string
  amount: number
  currency: string
  status: string
  description: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface BillingManagementTabProps {
  className?: string
}

export function BillingManagementTab({ className }: BillingManagementTabProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [transactions, setTransactions] = useState<StripeTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    setLoading(true)
    try {
      // Fetch payment statistics
      const statsResponse = await fetch('/api/admin/billing/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch transactions
      const transactionsResponse = await fetch('/api/admin/billing/transactions')
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
      case 'canceled':
        return 'destructive'
      case 'refunded':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transactionSearchTerm === '' || 
      transaction.user.name?.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.stripePaymentIntentId.toLowerCase().includes(transactionSearchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100) // Stripe amounts are in cents
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportTransactions = () => {
    // Create CSV data
    const csvData = filteredTransactions.map(transaction => ({
      'Transaction ID': transaction.stripePaymentIntentId,
      'User Name': transaction.user.name || 'Unknown',
      'User Email': transaction.user.email,
      'Amount': formatCurrency(transaction.amount, transaction.currency),
      'Status': transaction.status,
      'Description': transaction.description || '',
      'Date': formatDate(transaction.createdAt)
    }))

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Billing Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading billing data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Billing Management
          </CardTitle>
          <Button onClick={fetchBillingData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {stats && (
              <div className="space-y-6">
                {/* Revenue Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
                      <p className="text-xs text-muted-foreground">Current month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.averageTransactionValue)}</div>
                      <p className="text-xs text-muted-foreground">Per transaction</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Transaction Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Successful</CardTitle>
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.successfulTransactions}</div>
                      <p className="text-xs text-muted-foreground">
                        {((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)}% success rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Failed</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failedTransactions}</div>
                      <p className="text-xs text-muted-foreground">
                        {((stats.failedTransactions / stats.totalTransactions) * 100).toFixed(1)}% failure rate
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-4">
              {/* Transaction Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={transactionSearchTerm}
                    onChange={(e) => setTransactionSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportTransactions} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                {paginatedTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{transaction.user.name || 'Unknown User'}</h4>
                        <Badge variant="outline" className="text-xs">
                          {transaction.user.role}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(transaction.status)} className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{transaction.user.email}</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        {transaction.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.createdAt)} • ID: {transaction.stripePaymentIntentId}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {transaction.currency}
                      </div>
                    </div>
                  </div>
                ))}
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
            </div>
          </TabsContent>

          <TabsContent value="customers">
            {stats && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Top Paying Customers</h3>
                <div className="space-y-2">
                  {stats.topPayingUsers.map((customer, index) => (
                    <div key={customer.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{customer.userName || 'Unknown User'}</h4>
                          <p className="text-sm text-muted-foreground">{customer.userEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.transactionCount} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatCurrency(customer.totalSpent)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total spent
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Add default export
export default BillingManagementTab
