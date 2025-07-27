'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, Users, MessageSquare, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useTranslations } from 'next-intl'

interface PrivacySettings {
  profileVisibility: 'public' | 'verified_only' | 'private'
  showSkills: boolean
  showExperience: boolean
  showContactInfo: boolean
  showLocation: boolean
  applicationPrivacy: 'open' | 'selective' | 'private'
  allowDirectMessages: boolean
  showOnlineStatus: boolean
  dataSharing: boolean
  analyticsOptOut: boolean
}

export function PrivacySettingsCard() {
  const { user, refreshUser } = useSupabaseAuth()
  const t = useTranslations('settings.privacy')
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showSkills: true,
    showExperience: true,
    showContactInfo: false,
    showLocation: true,
    applicationPrivacy: 'open',
    allowDirectMessages: true,
    showOnlineStatus: true,
    dataSharing: false,
    analyticsOptOut: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load existing privacy settings
  useEffect(() => {
    const loadPrivacySettings = async () => {
      try {
        const response = await fetch('/api/user/privacy-settings')
        if (response.ok) {
          const privacyData = await response.json()
          setSettings(prevSettings => ({
            ...prevSettings,
            ...privacyData
          }))
        }
      } catch (error) {
        console.error('Failed to load privacy settings:', error)
      }
    }

    if (user) {
      loadPrivacySettings()
    }
  }, [user])

  const handleSettingChange = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success(t('settingsUpdated'))
        // Refresh user data to reflect privacy changes
        await refreshUser()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || t('updateFailed'))
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      toast.error(t('updateFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return t('visibility.public.description')
      case 'verified_only':
        return t('visibility.verifiedOnly.description')
      case 'private':
        return t('visibility.private.description')
      default:
        return ''
    }
  }

  const getApplicationPrivacyDescription = (privacy: string) => {
    switch (privacy) {
      case 'open':
        return t('applicationPrivacy.open.description')
      case 'selective':
        return t('applicationPrivacy.selective.description')
      case 'private':
        return t('applicationPrivacy.private.description')
      default:
        return ''
    }
  }

  if (!user) {
    return null
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
      <CardContent className="space-y-6">
        {/* Profile Visibility Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h3 className="text-lg font-medium">{t('profileVisibility.title')}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility">{t('profileVisibility.label')}</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value: PrivacySettings['profileVisibility']) =>
                  handleSettingChange('profileVisibility', value)
                }
              >
                <SelectTrigger id="profile-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t('visibility.public.label')}</SelectItem>
                  <SelectItem value="verified_only">{t('visibility.verifiedOnly.label')}</SelectItem>
                  <SelectItem value="private">{t('visibility.private.label')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getVisibilityDescription(settings.profileVisibility)}
              </p>
            </div>

            {/* Profile Details Visibility */}
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-skills" className="text-sm">
                  {t('profileDetails.showSkills')}
                </Label>
                <Switch
                  id="show-skills"
                  checked={settings.showSkills}
                  onCheckedChange={(checked) => handleSettingChange('showSkills', checked)}
                  disabled={settings.profileVisibility === 'private'}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-experience" className="text-sm">
                  {t('profileDetails.showExperience')}
                </Label>
                <Switch
                  id="show-experience"
                  checked={settings.showExperience}
                  onCheckedChange={(checked) => handleSettingChange('showExperience', checked)}
                  disabled={settings.profileVisibility === 'private'}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-location" className="text-sm">
                  {t('profileDetails.showLocation')}
                </Label>
                <Switch
                  id="show-location"
                  checked={settings.showLocation}
                  onCheckedChange={(checked) => handleSettingChange('showLocation', checked)}
                  disabled={settings.profileVisibility === 'private'}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-contact-info" className="text-sm">
                  {t('profileDetails.showContactInfo')}
                </Label>
                <Switch
                  id="show-contact-info"
                  checked={settings.showContactInfo}
                  onCheckedChange={(checked) => handleSettingChange('showContactInfo', checked)}
                  disabled={settings.profileVisibility === 'private'}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Application Privacy Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <h3 className="text-lg font-medium">{t('applicationPrivacy.title')}</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="application-privacy">{t('applicationPrivacy.label')}</Label>
              <Select
                value={settings.applicationPrivacy}
                onValueChange={(value: PrivacySettings['applicationPrivacy']) =>
                  handleSettingChange('applicationPrivacy', value)
                }
              >
                <SelectTrigger id="application-privacy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">{t('applicationPrivacy.open.label')}</SelectItem>
                  <SelectItem value="selective">{t('applicationPrivacy.selective.label')}</SelectItem>
                  <SelectItem value="private">{t('applicationPrivacy.private.label')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getApplicationPrivacyDescription(settings.applicationPrivacy)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Communication Privacy Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <h3 className="text-lg font-medium">{t('communication.title')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow-direct-messages">
                  {t('communication.allowDirectMessages')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('communication.directMessagesDescription')}
                </p>
              </div>
              <Switch
                id="allow-direct-messages"
                checked={settings.allowDirectMessages}
                onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="show-online-status">
                  {t('communication.showOnlineStatus')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('communication.onlineStatusDescription')}
                </p>
              </div>
              <Switch
                id="show-online-status"
                checked={settings.showOnlineStatus}
                onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Data & Analytics Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <h3 className="text-lg font-medium">{t('dataAnalytics.title')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="data-sharing">
                  {t('dataAnalytics.dataSharing')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('dataAnalytics.dataSharingDescription')}
                </p>
              </div>
              <Switch
                id="data-sharing"
                checked={settings.dataSharing}
                onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="analytics-opt-out">
                  {t('dataAnalytics.analyticsOptOut')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('dataAnalytics.analyticsDescription')}
                </p>
              </div>
              <Switch
                id="analytics-opt-out"
                checked={settings.analyticsOptOut}
                onCheckedChange={(checked) => handleSettingChange('analyticsOptOut', checked)}
              />
            </div>
          </div>
        </div>

        {/* Privacy Impact Alert */}
        {(settings.profileVisibility === 'private' || settings.applicationPrivacy === 'private') && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t('privacyImpactWarning')}
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? t('saving') : t('saveSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
