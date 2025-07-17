'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function SecurityCard() {
  const t = useTranslations('settings.security')
  
  const handleDeleteAccount = () => {
    // This would typically open a confirmation modal
    // For now, just show a toast
    toast.error(t('deleteAccountNotAvailable'))
  }

  return (
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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('deleteAccountDescription')}
              </p>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteAccount}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('deleteAccount')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
