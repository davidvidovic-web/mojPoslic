'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Users, MessageSquare, BarChart3, Settings, Lock } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function ClientQuickActions() {
  const t = useTranslations()
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {t('dashboard.quickActions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-foreground dark:hover:text-foreground"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <Search className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <div className="font-medium">{t('dashboard.client.quickActions.browseTaskers')}</div>
            <div className="text-xs text-muted-foreground">{t('dashboard.client.quickActions.browseTaskersDesc')}</div>
          </div>
        </Button>
        
        <Link href="/dashboard/jobs" className="block">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 hover:bg-green-50 dark:hover:bg-green-950/50 hover:text-foreground dark:hover:text-foreground"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">{t('dashboard.client.quickActions.manageApplications')}</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.client.quickActions.manageApplicationsDesc')}</div>
            </div>
          </Button>
        </Link>
        
        <Link href="/dashboard/messages" className="block">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-foreground dark:hover:text-foreground"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">{t('dashboard.client.quickActions.messageCenter')}</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.client.quickActions.messageCenterDesc')}</div>
            </div>
          </Button>
        </Link>
        
        <div className="pt-3 border-t space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-10 opacity-50 cursor-not-allowed hover:text-foreground dark:hover:text-foreground" 
            disabled
          >
            <div className="flex items-center justify-center w-6 h-6 rounded bg-muted">
              <BarChart3 className="h-3 w-3" />
            </div>
            <span className="text-sm">{t('dashboard.client.quickActions.viewAnalytics')}</span>
            <Lock className="h-3 w-3 ml-auto" />
          </Button>
          
          <Link href="/settings" className="block">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-10 hover:bg-muted hover:text-foreground dark:hover:text-foreground"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded bg-muted">
                <Settings className="h-3 w-3" />
              </div>
              <span className="text-sm">{t('dashboard.client.quickActions.accountSettings')}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
