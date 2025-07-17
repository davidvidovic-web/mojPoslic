'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Mail } from 'lucide-react'

export function HelpSupportCard() {
  const t = useTranslations('settings.helpSupport')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('documentation')}
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('contactSupport')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
