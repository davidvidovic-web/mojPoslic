'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Trash2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { DeleteAccountDialog } from './delete-account-dialog'

interface DeletionRequest {
  scheduledDeletion: string
}

interface SecurityCardProps {
  deletionRequest?: DeletionRequest | null
}

export function SecurityCard({ deletionRequest }: SecurityCardProps) {
  const t = useTranslations('settings.security')
  const { user } = useSupabaseAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteAccount = async (reason?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/delete-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationText: user?.name || user?.email?.split('@')[0],
          reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule deletion')
      }

      toast.success(t('deletionScheduled'))
      // Refresh the page to show the updated state
      window.location.reload()
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to schedule deletion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelDeletion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/delete-request', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel deletion')
      }

      toast.success(t('deletionCancelled'))
      // Refresh the page to show the updated state
      window.location.reload()
    } catch (error) {
      console.error('Cancel deletion error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel deletion')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">{t('dataPrivacy')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('privacyDescription')}
              </p>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-destructive">{t('dangerZone')}</h4>
              
              {deletionRequest ? (
                <Alert className="border-orange-200 bg-orange-50">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-orange-800">
                        {t('deletionScheduled')}
                      </p>
                      <p className="text-sm text-orange-700">
                        {t('deletionScheduledDescription', {
                          date: formatDate(deletionRequest.scheduledDeletion)
                        })}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelDeletion}
                        disabled={isLoading}
                        className="mt-2"
                      >
                        {isLoading ? 'Cancelling...' : t('cancelDeletion')}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('deleteAccountDescription')}
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('deleteAccount')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        username={user?.name || user?.email?.split('@')[0] || null}
        onConfirm={handleDeleteAccount}
      />
    </>
  )
}
