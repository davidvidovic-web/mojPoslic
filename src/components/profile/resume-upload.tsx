'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, Download, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { SupabaseFileUploadService } from '@/lib/supabase-file-upload'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"

interface ResumeUploadProps {
  currentResumeUrl?: string
  onResumeUploaded?: (resumeUrl: string) => void
  className?: string
}

interface ResumeFile {
  name: string
  url: string
  size: number
  uploadedAt: string
}

export function ResumeUpload({ 
  currentResumeUrl, 
  onResumeUploaded,
  className = ''
}: ResumeUploadProps) {
  const { user } = useSupabaseAuth()
  const t = useTranslations('profile.resume')
  const [isUploading, setIsUploading] = useState(false)
  const [currentResume, setCurrentResume] = useState<ResumeFile | null>(
    currentResumeUrl ? {
      name: 'Current Resume',
      url: currentResumeUrl,
      size: 0,
      uploadedAt: ''
    } : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file before upload
    try {
      // Check if it's a valid document
      if (!SupabaseFileUploadService.isDocumentFile(file.type)) {
        toast.error(t('errors.invalidFileType'))
        return
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error(t('errors.fileTooLarge'))
        return
      }

      // Upload file
      handleUpload(file)
    } catch (error) {
      console.error('File validation error:', error)
      toast.error(t('errors.uploadFailed'))
    }
  }

  const handleUpload = async (file: File) => {
    if (!user?.id) {
      toast.error(t('errors.notAuthenticated'))
      return
    }

    setIsUploading(true)

    try {
      // Upload to Supabase Storage
      const result = await SupabaseFileUploadService.uploadResume(file, user.id)

      // Create resume file object
      const resumeFile: ResumeFile = {
        name: file.name,
        url: result.url,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }

      setCurrentResume(resumeFile)

      // Call callback if provided
      onResumeUploaded?.(result.url)

      toast.success(t('uploadSuccess'))
    } catch (error) {
      console.error('Resume upload error:', error)
      toast.error(t('errors.uploadFailed'))
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveResume = async () => {
    if (!currentResume) return

    try {
      // Remove from state
      setCurrentResume(null)

      // Call callback if provided
      onResumeUploaded?.('')

      toast.success(t('removeSuccess'))
    } catch (error) {
      console.error('Resume removal error:', error)
      toast.error(t('errors.removeFailed'))
    }
  }

  const handleDownload = async () => {
    if (!currentResume) return

    try {
      // For now, just open the file URL
      // In production, you might want to use signed URLs for better security
      window.open(currentResume.url, '_blank')
    } catch (error) {
      console.error('Resume download error:', error)
      toast.error(t('errors.downloadFailed'))
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    return SupabaseFileUploadService.formatFileSize(bytes)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Current resume display */}
      {currentResume ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{currentResume.name}</p>
                  {currentResume.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(currentResume.size)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveResume}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Upload area */
        <Card 
          className="border-dashed border-2 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={openFileDialog}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('uploadTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('uploadDescription')}
              </p>
              <Button 
                type="button"
                variant="outline" 
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation()
                  openFileDialog()
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('selectFile')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload button (alternative) */}
      {currentResume && (
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('uploading')}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {t('uploadNew')}
            </>
          )}
        </Button>
      )}

      {/* Instructions */}
      <p className="text-xs text-muted-foreground">
        {t('instructions')}
      </p>
    </div>
  )
}
