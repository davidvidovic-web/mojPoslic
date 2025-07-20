'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string | null
  onConfirm: (reason?: string) => Promise<void>
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  username,
  onConfirm,
}: DeleteAccountDialogProps) {
  const t = useTranslations('settings.security')
  const [confirmationText, setConfirmationText] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isValid = confirmationText === username
  const hasUsername = username && username.length > 0

  const handleConfirm = async () => {
    if (!isValid || !hasUsername) {
      toast.error('Please enter your username correctly')
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(reason || undefined)
      onOpenChange(false)
      setConfirmationText('')
      setReason('')
    } catch (error) {
      console.error('Delete account error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      setConfirmationText('')
      setReason('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('confirmDeletion')}
          </DialogTitle>
          <DialogDescription>
            {t('confirmDeletionDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('deleteAccountDescription')}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">{t('reasonForDeletion')}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              {t('typeUsernameToConfirm')}
              {hasUsername && (
                <span className="ml-1 font-mono text-sm">({username})</span>
              )}
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={t('usernameConfirmationPlaceholder')}
              className={
                confirmationText.length > 0 && !isValid
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {confirmationText.length > 0 && !isValid && hasUsername && (
              <p className="text-sm text-destructive">
                Please type &quot;{username}&quot; exactly as shown
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || !hasUsername || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {t('confirmDeletionButton')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
