'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CheckCircle, Pause, Play, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

type JobStatus = 'active' | 'inactive' | 'completed' | 'expired'

interface JobStatusManagerProps {
  jobId: string
  currentStatus: JobStatus
  jobTitle: string
  onStatusUpdate?: (newStatus: JobStatus) => void
  disabled?: boolean
}

export function JobStatusManager({ 
  jobId, 
  currentStatus, 
  jobTitle, 
  onStatusUpdate, 
  disabled = false 
}: JobStatusManagerProps) {
  const t = useTranslations('jobs')
  const tCommon = useTranslations('common')

  const statusConfig = {
    active: {
      label: t('status.active'),
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      icon: Play,
      description: t('statusManager.statusDescriptions.active')
    },
    inactive: {
      label: t('status.inactive'),
      color: 'bg-muted text-muted-foreground',
      icon: Pause,
      description: t('statusManager.statusDescriptions.inactive')
    },
    completed: {
      label: t('status.completed'),
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      icon: CheckCircle,
      description: t('statusManager.statusDescriptions.completed')
    },
    expired: {
      label: t('status.expired'),
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      icon: Clock,
      description: t('statusManager.statusDescriptions.expired')
    }
  }

  const [selectedStatus, setSelectedStatus] = useState<JobStatus>(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      setIsDialogOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update job status')
      }

      await response.json() // Consume the response
      toast.success(`Job status updated to ${statusConfig[selectedStatus].label}`)
      onStatusUpdate?.(selectedStatus)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update job status')
      setSelectedStatus(currentStatus) // Reset to original status
    } finally {
      setIsLoading(false)
    }
  }

  const StatusIcon = statusConfig[currentStatus].icon

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`${statusConfig[currentStatus].color} border-0`}
      >
        <StatusIcon className="h-3 w-3 mr-1" />
        {statusConfig[currentStatus].label}
      </Badge>

      {!disabled && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>{t('statusManager.updateJobStatus')}</DialogTitle>
              <DialogDescription>
                {t('statusManager.changeStatusOf', { title: jobTitle })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('statusManager.currentStatus')}</label>
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-sm">{statusConfig[currentStatus].label}</span>
                  <span className="text-xs text-muted-foreground">
                    - {statusConfig[currentStatus].description}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('statusManager.newStatus')}</label>
                <Select value={selectedStatus} onValueChange={(value: JobStatus) => setSelectedStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const Icon = config.icon
                      return (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {selectedStatus !== currentStatus && (
                  <p className="text-xs text-muted-foreground">
                    {statusConfig[selectedStatus].description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatus(currentStatus)
                  setIsDialogOpen(false)
                }}
                disabled={isLoading}
              >
                {tCommon('buttons.cancel')}
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={isLoading || selectedStatus === currentStatus}
              >
                {isLoading ? tCommon('actions.updating') : tCommon('actions.updateStatus')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
