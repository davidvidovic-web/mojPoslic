'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { ConditionalHeader } from '@/components/core/conditional-header'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProfileSettingsCard } from '@/components/settings/profile-settings-card'
import { AccountInfoCard } from '@/components/settings/account-info-card'
import { SecurityCard } from '@/components/settings/security-card'
// import { PrivacySettingsCard } from '@/components/settings/privacy-settings-card'
import { AppearanceCard } from '@/components/settings/appearance-card'
import { HelpSupportCard } from '@/components/settings/help-support-card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface DeletionRequest {
  scheduledDeletion: string
}

export default function SettingsPage() {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null)

  const t = useTranslations()
  const tSettings = (key: string) => t(`settings.${key}`)
  const tCommon = (key: string) => t(`common.buttons.${key}`)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  // Fetch deletion request status
  useEffect(() => {
    const fetchDeletionRequest = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/user/deletion-status')
        if (response.ok) {
          const data = await response.json()
          setDeletionRequest(data.deletionRequest)
        }
      } catch (error) {
        console.error('Error fetching deletion request:', error)
      }
    }

    if (user) {
      fetchDeletionRequest()
    }
  }, [user])

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <ConditionalHeader />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {tCommon('back')}
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{tSettings('title')}</h1>
            <p className="text-muted-foreground mt-2">
              {tSettings('description')}
            </p>
          </div>

          {deletionRequest && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive font-medium">
                {tSettings('accountDeletionScheduled')} {new Date(deletionRequest.scheduledDeletion).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <ProfileSettingsCard />
              <AccountInfoCard />
              <SecurityCard />
            </div>
            <div className="space-y-6">
              {/* <PrivacySettingsCard /> */}
              <AppearanceCard />
              <HelpSupportCard />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
