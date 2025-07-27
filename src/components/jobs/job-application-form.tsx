'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleRichTextEditor } from '@/components/ui/simple-rich-text-editor'
import { useCreateApplicationMutation } from '@/hooks/queries/useJobs'
import { Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface JobApplicationFormProps {
  jobId: string
  jobTitle: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function JobApplicationForm({ 
  jobId, 
  jobTitle, 
  onSuccess, 
  onCancel 
}: JobApplicationFormProps) {
  const t = useTranslations('jobApplication')
  const [message, setMessage] = useState('')

  const applyMutation = useCreateApplicationMutation()

  // Helper function to strip HTML tags for character count
  const getTextLength = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent?.length || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || getTextLength(message) < 10) {
      toast.error(t('pleaseWriteMessage'))
      return
    }

    if (getTextLength(message) > 1000) {
      toast.error(t('messageTooLong'))
      return
    }

    try {
      await applyMutation.mutateAsync({
        jobId,
        data: {
          message: message
        }
      })

      // Reset form
      setMessage('')
      
      toast.success('Application submitted successfully!')
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation and shown via toast
      console.error('Application error:', error)
    }
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{t('applyFor')} {jobTitle}</CardTitle>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="application-message" className="text-sm font-medium">
              {t('applicationMessage')}
            </Label>
            <SimpleRichTextEditor
              value={message}
              onChange={setMessage}
              placeholder={t('applicationMessagePlaceholder')}
              className="min-h-[200px]"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {getTextLength(message)}/1000 {t('charactersCount')}
              </span>
              <span>
                {t('richTextHelp')}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={!message.trim() || getTextLength(message) < 10 || applyMutation.isPending}
              className="w-full"
            >
              {applyMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('submitting')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {t('submitApplication')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
