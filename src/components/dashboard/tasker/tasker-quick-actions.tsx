'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, User, BarChart } from "lucide-react"
import Link from "next/link"
import { useTranslations } from 'next-intl'

export function TaskerQuickActions() {
  const t = useTranslations()
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <BarChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {t('dashboard.quickActions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Find Jobs */}
        <Link href="/" className="block">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-foreground dark:hover:text-foreground"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">{t('dashboard.tasker.quickActions.findJobs')}</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.tasker.quickActions.findJobsDesc')}</div>
            </div>
          </Button>
        </Link>

        {/* Update Profile */}
        <Link href="/settings" className="block">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-foreground dark:hover:text-foreground"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <div className="font-medium">{t('dashboard.tasker.quickActions.updateProfile')}</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.tasker.quickActions.updateProfileDesc')}</div>
            </div>
          </Button>
        </Link>

        {/* Tips Section */}
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            {t('dashboard.tasker.quickActions.proTip')}
          </h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {t('dashboard.tasker.quickActions.proTipMessage')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
