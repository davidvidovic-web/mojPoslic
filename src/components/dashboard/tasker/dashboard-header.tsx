'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/jobs/job-post-form/multi-step-job-form'
import { Plus } from 'lucide-react'
import { formatDisplayName } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface DashboardHeaderProps {
  userName?: string
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  onJobPosted: () => void
}

export function DashboardHeader({ userName, isDialogOpen, setIsDialogOpen, onJobPosted }: DashboardHeaderProps) {
  const t = useTranslations()
  
  // Get time-based greeting key
  const getGreetingKey = () => {
    const now = new Date()
    const bosniaTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Sarajevo" }))
    const hour = bosniaTime.getHours()
    
    if (hour >= 5 && hour < 12) {
      return 'greetings.morning'
    } else if (hour >= 12 && hour < 18) {
      return 'greetings.day'
    } else {
      return 'greetings.evening'
    }
  }
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.clientDashboard')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t(getGreetingKey())}, <span className="font-bold">{formatDisplayName(userName)}</span>!
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-green hover:bg-brand-green/90 text-background font-bold border-0 transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.actions.postJob')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('jobs.create.title')}</DialogTitle>
            </DialogHeader>
            <MultiStepJobForm onJobPosted={onJobPosted} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
