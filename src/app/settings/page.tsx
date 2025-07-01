'use client'

import { ProfileSettingsCard } from '@/components/settings/profile-settings-card'
import { AccountInfoCard } from '@/components/settings/account-info-card'
import { AppearanceCard } from '@/components/settings/appearance-card'
import { SecurityCard } from '@/components/settings/security-card'
import { HelpSupportCard } from '@/components/settings/help-support-card'

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <ProfileSettingsCard />
        <AccountInfoCard />
        <AppearanceCard />
        <SecurityCard />
        <HelpSupportCard />
      </div>
    </div>
  )
}
