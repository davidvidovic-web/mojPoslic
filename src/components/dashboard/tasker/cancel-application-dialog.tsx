'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CancelApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  jobTitle?: string
  isSubmitting?: boolean
}

export function CancelApplicationDialog({
  open,
  onOpenChange,
  onConfirm,
  jobTitle = 'this job',
  isSubmitting = false,
}: CancelApplicationDialogProps) {
  const t = useTranslations('dashboard.applicationManagement')

  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {t('cancelApplication')}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('cancelConfirm')}
              </p>
              <p className="text-sm font-medium text-foreground">
                {jobTitle}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Warning box */}
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            <strong>{t('cancelNotAllowedTitle') || 'Warning:'}</strong>{' '}
            {t('cancelWarning') || 'This action cannot be undone. Your application will be permanently removed.'}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('cancelAction') || 'Go Back'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>{t('cancelling') || 'Cancelling...'}</>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                {t('confirmCancelApplication') || 'Yes, Cancel Application'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
