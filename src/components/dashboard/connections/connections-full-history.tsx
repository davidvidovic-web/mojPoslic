'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  ShoppingCart,
  Zap
} from 'lucide-react'

import { useTranslations } from 'next-intl'
import { useConnectionsManager } from '@/hooks/use-connections'

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

export function ConnectionsFullHistory() {
  const t = useTranslations('dashboard.connections')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  
  // Use the same hook as connections widget
  const { 
    connections, 
    history: rawHistory, 
    isLoading: loading,
    error,
    refetchAll 
  } = useConnectionsManager()

  // Transform history data to match the expected interface
  const history: ConnectionHistoryEntry[] = rawHistory.map(item => ({
    id: item.id,
    action: item.action,
    actionLabel: item.action, // Use action as actionLabel
    amount: Math.abs(item.amountChanged),
    description: item.reason || null,
    jobId: null, // Not available in the new structure
    createdAt: item.createdAt,
    isPositive: item.amountChanged > 0,
    isNegative: item.amountChanged < 0
  }))

  // Function to translate action labels
  const getTranslatedActionLabel = (actionLabel: string) => {
    // Map common action labels to translation keys (both formatted and raw backend types)
    const actionMap: Record<string, string> = {
      // Formatted action labels
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
      'Initial Signup': 'initialSignup',
      
      // Backend action types (underscore format)
      'MONTHLY_REFRESH': 'monthlyRefresh',
      'INITIAL_SIGNUP': 'initialSignup',
      'ROLE_CHANGE': 'roleChange',
      'JOB_APPLICATION': 'jobApplication',
      'JOB_POST_CLIENT': 'jobPostClient',
      'JOB_POST_COMPANY': 'jobPostCompany',
      'ADMIN_ADJUSTMENT': 'adminAdjustment',
      'PURCHASE': 'purchase'
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
  const totalBought = history.filter(h => h.isPositive && (h.actionLabel === 'Purchase' || h.actionLabel === 'PURCHASE')).reduce((sum, h) => sum + h.amount, 0)
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <History className="h-6 w-6" />
            {t('fullHistory')}
          </h2>
        </div>

        {/* Summary Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-muted rounded animate-pulse"></div>
            <div className="w-32 h-10 bg-muted rounded animate-pulse"></div>
            <div className="w-24 h-10 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* History skeleton */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            {t('fullHistory')}
          </h2>
        </div>
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">{t('errorTitle')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetchAll} variant="outline">
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Title */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <History className="h-6 w-6" />
          {t('fullHistory')}
        </h2>
        <p className="text-muted-foreground">
          {t('fullHistoryDescription') || 'Complete history of all your connection transactions'}
        </p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">{t('currentBalance')}</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{connections}</p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{t('totalReceived')}</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+{totalReceived}</p>
        </div>
        
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">{t('totalBought')}</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{totalBought}</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">{t('totalSpent')}</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">-{totalSpent}</p>
        </div>
      </div>
      
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
      <Card>
        <CardContent className="p-6">
          {filteredHistory.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
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
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">{t('noTransactionsFound')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all' 
                  ? t('tryAdjustingSearch')
                  : t('connectionHistoryWillAppear')}
              </p>
            </div>
          )}
          
          {/* Results count */}
          {filteredHistory.length > 0 && (
            <div className="text-sm text-muted-foreground text-center pt-4 mt-4 border-t">
              {t('showingTransactions', { count: filteredHistory.length, total: history.length })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
