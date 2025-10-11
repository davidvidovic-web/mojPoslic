'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, ChevronDown, ChevronUp } from 'lucide-react'

interface ConnectionHistoryEntry {
  id: string
  action: string
  connectionsBefore: number
  connectionsAfter: number
  amountChanged: number
  reason?: string
  createdAt: string
  adminId?: string
  jobId?: string
}

interface ConnectionActivityProps {
  history: ConnectionHistoryEntry[]
}

export function ConnectionActivity({ history }: ConnectionActivityProps) {
  const t = useTranslations('dashboard.connections')
  const [showFullHistory, setShowFullHistory] = useState(false)
  
  const recentHistory = showFullHistory ? history : history.slice(0, 5)

  // Function to translate action labels (same as full history component)
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <History className="h-4 w-4" />
          {t('activity.title')}
        </h4>
        {history.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullHistory(!showFullHistory)}
          >
            {showFullHistory ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {t('activity.showLess')}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {t('activity.showAll', { count: history.length })}
              </>
            )}
          </Button>
        )}
      </div>
      
      {recentHistory.length > 0 ? (
        <ScrollArea className={showFullHistory ? "h-48" : "h-32"}>
          <div className="space-y-2">
            {recentHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-[var(--radius)] bg-muted/50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{getTranslatedActionLabel(entry.action)}</p>
                  {entry.reason && (
                    <p className="text-xs text-muted-foreground">{getTranslatedDescription(entry.reason)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    entry.amountChanged > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {entry.amountChanged > 0 ? '+' : ''}{entry.amountChanged}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground">{t('activity.noActivity')}</p>
      )}
    </div>
  )
}
