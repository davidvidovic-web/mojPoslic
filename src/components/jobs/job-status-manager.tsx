'use client'

import { useState } from 'react'
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

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    icon: Play,
    description: 'Job is currently accepting applications'
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
    icon: Pause,
    description: 'Job is paused and not accepting applications'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    icon: CheckCircle,
    description: 'Position has been filled successfully'
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    icon: Clock,
    description: 'Job posting has expired'
  }
}

export function JobStatusManager({ 
  jobId, 
  currentStatus, 
  jobTitle, 
  onStatusUpdate, 
  disabled = false 
}: JobStatusManagerProps) {
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Job Status</DialogTitle>
              <DialogDescription>
                Change the status of &quot;{jobTitle}&quot;
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Status</label>
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-sm">{statusConfig[currentStatus].label}</span>
                  <span className="text-xs text-muted-foreground">
                    - {statusConfig[currentStatus].description}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
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
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={isLoading || selectedStatus === currentStatus}
              >
                {isLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
