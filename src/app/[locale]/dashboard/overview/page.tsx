'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function DashboardOverview() {
  const router = useRouter()
  const t = useTranslations('dashboard.loading')

  useEffect(() => {
    // Redirect to the main dashboard
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('redirecting')}</p>
      </div>
    </div>
  )
}
