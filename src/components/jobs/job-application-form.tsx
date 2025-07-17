'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApplyToJob } from '@/hooks/use-applications'
import { Upload, FileText, Send, X } from 'lucide-react'
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
  const [coverLetter, setCoverLetter] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const applyMutation = useApplyToJob()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('invalidFileType'))
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(t('fileTooLarge'))
        return
      }

      setResume(file)
    }
  }

  const removeResume = () => {
    setResume(null)
    // Clear the input
    const input = document.getElementById('resume-upload') as HTMLInputElement
    if (input) input.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!coverLetter.trim()) {
      toast.error(t('pleaseWriteCoverLetter'))
      return
    }

    try {
      // TODO: Upload resume file to cloud storage
      // For now, we'll just store the filename
      const resumeUrl = resume ? `uploads/resumes/${Date.now()}-${resume.name}` : undefined

      await applyMutation.mutateAsync({
        jobId,
        data: {
          message: coverLetter,
          resume: resumeUrl
        }
      })

      // Reset form
      setCoverLetter('')
      setResume(null)
      setShowPreview(false)
      
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation
      console.error('Application error:', error)
    }
  }

  if (showPreview) {
    return (
      <Card className="w-full border-0 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            {t('applicationPreview')}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              {t('applyingFor')}
            </Label>
            <p className="text-lg font-semibold">{jobTitle}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              {t('coverLetter')}:
            </Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md border">
              <p className="whitespace-pre-wrap">{coverLetter}</p>
            </div>
          </div>

          {resume && (
            <div>
              <Label className="text-sm font-medium text-gray-700">
                {t('resume')}:
              </Label>
              <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded-md border">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm">{resume.name}</span>
                <span className="text-xs text-gray-500">
                  ({(resume.size / 1024 / 1024).toFixed(1)} {t('mb')})
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleSubmit}
              disabled={applyMutation.isPending}
              className="flex-1"
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
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={applyMutation.isPending}
              className="flex-1"
            >
              {t('backToEdit')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
            <Label htmlFor="cover-letter" className="text-sm font-medium">
              {t('coverLetterRequired')}
            </Label>
            <Textarea
              id="cover-letter"
              placeholder={t('coverLetterPlaceholder')}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={10}
              className="min-h-[200px] resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              {coverLetter.length}/2000 {t('charactersCount')}
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="resume-upload" className="text-sm font-medium">
              {t('resume')}
            </Label>
            {!resume ? (
              <div>
                <label
                  htmlFor="resume-upload"
                  className="flex items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="text-center space-y-2">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {t('clickToUpload')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('fileFormat')}
                      </p>
                    </div>
                  </div>
                </label>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{resume.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(resume.size / 1024 / 1024).toFixed(1)} {t('mb')}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeResume}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!coverLetter.trim()}
              className="flex-1"
            >
              {t('previewApplication')}
            </Button>
            <Button
              type="submit"
              disabled={!coverLetter.trim()}
              className="flex-1"
            >
              {t('submitApplication')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
