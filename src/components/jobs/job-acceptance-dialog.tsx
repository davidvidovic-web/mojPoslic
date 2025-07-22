'use client'

import { useState } from 'react'
import { useJobAcceptance, type JobAcceptanceData } from '@/hooks/use-job-acceptance'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, UserCheck, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'

const jobAcceptanceSchema = z.object({
  agreedSalary: z.string().optional(),
  startDate: z.date().optional(),
  notes: z.string().optional(),
})

type JobAcceptanceFormData = z.infer<typeof jobAcceptanceSchema>

interface JobAcceptanceDialogProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  applicationId: string
  jobTitle: string
  taskerName: string
  originalSalary?: string
  originalStartDate?: string
  onAcceptanceSuccess?: () => void
}

export function JobAcceptanceDialog({
  isOpen,
  onClose,
  jobId,
  applicationId,
  jobTitle,
  taskerName,
  originalSalary,
  originalStartDate,
  onAcceptanceSuccess
}: JobAcceptanceDialogProps) {
  const t = useTranslations('jobs')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { acceptTasker, isAccepting } = useJobAcceptance()

  const form = useForm<JobAcceptanceFormData>({
    resolver: zodResolver(jobAcceptanceSchema),
    defaultValues: {
      agreedSalary: originalSalary || '',
      startDate: originalStartDate ? new Date(originalStartDate) : undefined,
      notes: '',
    },
  })

  const handleSubmit = async (data: JobAcceptanceFormData) => {
    if (!showConfirmation) {
      setShowConfirmation(true)
      return
    }

    try {
      const acceptanceData: JobAcceptanceData = {
        agreedSalary: data.agreedSalary ? parseFloat(data.agreedSalary) : undefined,
        startDate: data.startDate ? data.startDate.toISOString() : undefined,
        notes: data.notes || undefined,
      }

      await acceptTasker(jobId, applicationId, acceptanceData)
      
      // Reset form and close dialog
      form.reset()
      setShowConfirmation(false)
      onClose()
      
      // Call success callback
      if (onAcceptanceSuccess) {
        onAcceptanceSuccess()
      }
    } catch (error) {
      console.error('Error accepting tasker:', error)
      setShowConfirmation(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    form.reset()
    onClose()
  }

  const formValues = form.getValues()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            {showConfirmation ? 'Confirm Job Assignment' : 'Accept Tasker'}
          </DialogTitle>
          <DialogDescription>
            {showConfirmation 
              ? `Confirm that you want to accept ${taskerName} for "${jobTitle}". This action cannot be undone.`
              : `Fill in the final details to accept ${taskerName} for the job "${jobTitle}".`
            }
          </DialogDescription>
        </DialogHeader>

        {showConfirmation ? (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Important Notice</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Accepting this tasker will:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 list-disc list-inside space-y-1">
                  <li>Lock the job and reject all other applications</li>
                  <li>Create a job assignment for {taskerName}</li>
                  <li>Send acceptance notifications to all involved parties</li>
                  <li>Move the job to your active assignments</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Assignment Summary:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Tasker:</strong> {taskerName}</p>
                <p><strong>Job:</strong> {jobTitle}</p>
                {formValues.agreedSalary && (
                  <p><strong>Agreed Salary:</strong> {formValues.agreedSalary} KM</p>
                )}
                {formValues.startDate && (
                  <p><strong>Start Date:</strong> {format(formValues.startDate, 'PPP')}</p>
                )}
                {formValues.notes && (
                  <p><strong>Notes:</strong> {formValues.notes}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="agreedSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agreed Salary (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter agreed salary"
                          className="pr-12"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">KM</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Final agreed salary amount. Leave empty to use the original job posting salary.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When should the tasker start working? Leave empty to use the original job start date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any additional instructions or notes for the tasker..."
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any special instructions or additional information for the tasker.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isAccepting}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isAccepting}
            className={showConfirmation ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isAccepting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {showConfirmation ? 'Accepting...' : 'Processing...'}
              </>
            ) : (
              showConfirmation ? 'Confirm Acceptance' : 'Review & Accept'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
