'use client'

import { useTranslations } from 'next-intl'

export function DashboardFooter() {
  const t = useTranslations('common.footer')
  
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
