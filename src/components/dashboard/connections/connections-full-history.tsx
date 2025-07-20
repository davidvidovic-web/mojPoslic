'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  History, 
  Search, 
  Filter, 
  Download,
  Calendar,
  TrendingDown,
  Plus,
  ShoppingCart
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface ConnectionHistoryEntry {
  id: string
  action: string
  actionLabel: string
  amount: number
  description: string | null
  jobId: string | null
  createdAt: string
  isPositive: boolean
  isNegative: boolean
}

interface ConnectionsFullHistoryProps {
  className?: string
}

export function ConnectionsFullHistory({ className }: ConnectionsFullHistoryProps) {
  const t = useTranslations('dashboard.connections')
  const [history, setHistory] = useState<ConnectionHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Function to translate action labels
  const getTranslatedActionLabel = (actionLabel: string) => {
    // Map common action labels to translation keys
    const actionMap: Record<string, string> = {
      'Job Application': 'jobApplication',
      'Job Application (Professional)': 'jobApplicationProfessional',
      'Quick Job Posting': 'quickJobPosting',
      'Part-time Job Posting': 'partTimeJobPosting',
      'Full-time Job Posting': 'fullTimeJobPosting',
      'Remote Job Posting': 'remoteJobPosting',
      'Purchase': 'purchase',
      'Monthly Refresh': 'monthlyRefresh',
      'Bonus': 'bonus',
      'Refund': 'refund',
      'Initial Signup': 'initialSignup'
    }
    
    // Return translated label if exists, otherwise return original
    return actionMap[actionLabel] ? t(actionMap[actionLabel]) : actionLabel
  }

  // Function to translate descriptions
  const getTranslatedDescription = (description: string) => {
    // Map common descriptions to translation keys
    const descriptionMap: Record<string, string> = {
      'Welcome bonus connections (monthly refresh eligible)': 'welcomeBonusDescription',
      'Welcome bonus connections': 'welcomeBonusDescriptionNoRefresh',
      'Role changed to tasker (monthly refresh eligible)': 'roleChangeDescription'
    }
    
    // Return translated description if exists, otherwise return original
    return descriptionMap[description] ? t(descriptionMap[description]) : description
  }

  useEffect(() => {
    fetchConnectionHistory()
  }, [])

  const fetchConnectionHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/connections/history')
      if (!response.ok) {
        throw new Error('Failed to fetch connection history')
      }
      const data = await response.json()
      
      // Ensure we always have an array
      const historyArray = Array.isArray(data) ? data : (data?.history || [])
      setHistory(historyArray)
    } catch (error) {
      console.error('Error fetching connection history:', error)
      toast.error('Failed to load connection history')
      setHistory([]) // Ensure we set an empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort history - ensure history is always an array
  const filteredHistory = (Array.isArray(history) ? history : [])
    .filter(entry => {
      const translatedLabel = getTranslatedActionLabel(entry.actionLabel)
      const translatedDescription = entry.description ? getTranslatedDescription(entry.description) : ''
      const matchesSearch = translatedLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.actionLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (translatedDescription && translatedDescription.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'positive' && entry.isPositive) ||
                           (filterType === 'negative' && entry.isNegative)
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  // Get summary stats with more detailed breakdown
  const totalReceived = history.filter(h => h.isPositive).reduce((sum, h) => sum + h.amount, 0)
  const totalBought = history.filter(h => h.isPositive && h.actionLabel === 'Purchase').reduce((sum, h) => sum + h.amount, 0)
  const totalSpent = history.filter(h => h.isNegative).reduce((sum, h) => sum + h.amount, 0)

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Action', 'Description', 'Amount', 'Type'],
      ...filteredHistory.map(entry => [
        new Date(entry.createdAt).toLocaleDateString(),
        entry.actionLabel,
        entry.description || '',
        entry.amount.toString(),
        entry.isPositive ? 'Credit' : 'Debit'
      ])
    ].map(row => row.join(',')).join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `connection-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('fullHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {t('fullHistory')}
        </CardTitle>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{t('totalReceived')}</span>
            </div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">+{totalReceived}</p>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">{t('totalBought')}</span>
            </div>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{totalBought}</p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">{t('totalSpent')}</span>
            </div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">-{totalSpent}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchTransactions')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={(value: 'all' | 'positive' | 'negative') => setFilterType(value)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="positive">{t('credits')}</SelectItem>
                <SelectItem value="negative">{t('debits')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="oldest">{t('oldest')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </Button>
          </div>
        </div>
        
        {/* History List */}
        {filteredHistory.length > 0 ? (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{getTranslatedActionLabel(entry.actionLabel)}</h4>
                      <Badge variant={entry.isPositive ? 'default' : 'destructive'} className="text-xs">
                        {entry.isPositive ? '+' : '-'}{entry.amount}
                      </Badge>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mb-1">{getTranslatedDescription(entry.description)}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      <span>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                      {entry.jobId && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                          Job ID: {entry.jobId.slice(-8)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      entry.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {entry.isPositive ? '+' : '-'}{entry.amount}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {entry.action.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noTransactionsFound')}</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? t('tryAdjustingSearch')
                : t('connectionHistoryWillAppear')}
            </p>
          </div>
        )}
        
        {/* Results count */}
        {filteredHistory.length > 0 && (
          <div className="text-sm text-muted-foreground text-center pt-2 border-t">
            {t('showingTransactions', { count: filteredHistory.length, total: history.length })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
