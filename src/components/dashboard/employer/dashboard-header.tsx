'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MultiStepJobForm } from '@/components/job-post-form/multi-step-job-form'
import { Plus } from 'lucide-react'

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Client Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {userName}! Manage your job postings here.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
