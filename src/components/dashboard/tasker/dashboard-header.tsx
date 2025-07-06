'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/jobs/job-post-form/multi-step-job-form'
import { Plus } from 'lucide-react'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'

interface DashboardHeaderProps {
  userName?: string
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
  onJobPosted: () => void
}

export function DashboardHeader({ userName, isDialogOpen, setIsDialogOpen, onJobPosted }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Client Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(userName)}</span>!
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-green hover:bg-brand-green/90 text-white font-bold border-0 transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post a New Job</DialogTitle>
            </DialogHeader>
            <MultiStepJobForm onJobPosted={onJobPosted} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
