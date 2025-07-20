'use client'

import { useTranslations } from 'next-intl'

export function GlobalFooter() {
  const t = useTranslations('homepage.footer')
  
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  )
}

// Keep the old export for backward compatibility
export const DashboardFooter = GlobalFooter
