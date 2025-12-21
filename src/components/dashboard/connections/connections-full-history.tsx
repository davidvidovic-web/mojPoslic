'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    // Handle dynamic purchase action labels first
    const purchaseMatch = actionLabel.match(/Purchase (\d+) Connections/)
    if (purchaseMatch) {
      const [, connections] = purchaseMatch
      return t('purchaseConnectionsAction', { connections })
    }
    
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
      'PURCHASE': 'purchase',
      'JOB_FEATURE': 'featureJob',
      'Featured job': 'featureJob',
      'PROMOTE_JOB': 'promoteJob',
      'JOB_PROMOTION': 'promoteJob'
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
    
    // Handle purchase descriptions with dynamic content
    const purchasePackageMatch = description.match(/Purchase of (.+) \((\d+) connections\)/)
    if (purchasePackageMatch) {
      const [, name, connections] = purchasePackageMatch
      return t('purchasePackageDescription', { name, connections })
    }
    
    const purchaseConnectionsMatch = description.match(/Purchase of (\d+) connections/)
    if (purchaseConnectionsMatch) {
      const [, connections] = purchaseConnectionsMatch
      return t('purchaseConnectionsDescription', { connections })
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
      [t('tableHeaders.dateTime'), t('tableHeaders.action'), t('tableHeaders.description'), t('tableHeaders.amount'), t('tableHeaders.type')],
      ...filteredHistory.map(entry => [
        new Date(entry.createdAt).toLocaleDateString(),
        getTranslatedActionLabel(entry.actionLabel),
        entry.description ? getTranslatedDescription(entry.description) : '',
        entry.amount.toString(),
        entry.isPositive ? t('transactionTypes.credit') : t('transactionTypes.debit')
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
        {/* Summary Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="w-24 h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* History skeleton */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
          <History className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('errorTitle')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={refetchAll} variant="outline" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800">
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('currentBalance')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{connections}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('totalReceived')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">+{totalReceived}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('totalBought')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">+{totalBought}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('totalSpent')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">-{totalSpent}</p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder={t('searchTransactions')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(value: 'all' | 'positive' | 'negative') => setFilterType(value)}>
            <SelectTrigger className="w-32 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Filter className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="positive">{t('credits')}</SelectItem>
              <SelectItem value="negative">{t('debits')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
            <SelectTrigger className="w-32 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Calendar className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('newest')}</SelectItem>
              <SelectItem value="oldest">{t('oldest')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={exportHistory} className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>
      
      {/* History Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg">
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 font-medium text-sm text-gray-900 dark:text-gray-100">
                <div>{t('tableHeaders.dateTime')}</div>
                <div>{t('tableHeaders.action')}</div>
                <div>{t('tableHeaders.description')}</div>
                <div className="text-center">{t('tableHeaders.type')}</div>
                <div className="text-right">{t('tableHeaders.amount')}</div>
              </div>
              
              {/* Table Body */}
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[500px]">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      {/* Date & Time */}
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getTranslatedActionLabel(entry.actionLabel)}
                        </div>
                        {entry.jobId && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {t('jobLabel')}: {entry.jobId.slice(-8)}
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      <div>
                        {entry.description ? (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {getTranslatedDescription(entry.description)}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                            {t('noAdditionalDetails')}
                          </div>
                        )}
                      </div>
                      
                      {/* Type Text */}
                      <div className="text-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.isPositive ? t('transactionTypes.credit') : t('transactionTypes.debit')}
                        </span>
                      </div>
                      
                      {/* Amount */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {entry.isPositive ? '+' : '-'}{entry.amount}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('connections')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <History className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('noTransactionsFound')}</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm || filterType !== 'all' 
                ? t('tryAdjustingSearch')
                : t('connectionHistoryWillAppear')}
            </p>
          </div>
        )}
        
        {/* Results count */}
        {filteredHistory.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
            {t('showingTransactions', { count: filteredHistory.length, total: history.length })}
          </div>
        )}
      </div>
    </div>
  )
}
