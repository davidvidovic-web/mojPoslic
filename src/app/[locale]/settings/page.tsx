'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ProfileSettingsCard } from '@/components/settings/profile-settings-card'
import { AccountInfoCard } from '@/components/settings/account-info-card'
import { SecurityCard } from '@/components/settings/security-card'
import { AppearanceCard } from '@/components/settings/appearance-card'
import { HelpSupportCard } from '@/components/settings/help-support-card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const tSettings = useTranslations('settings')
  const tCommon = useTranslations('common')
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tCommon('status.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {tSettings('backToDashboard')}
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{tSettings('title')}</h1>
          <p className="text-muted-foreground">
            {tSettings('description')}
          </p>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          <ProfileSettingsCard />
          <AccountInfoCard />
          <SecurityCard />
          <AppearanceCard />
          <HelpSupportCard />
        </div>
      </div>
    </div>
  )
}
