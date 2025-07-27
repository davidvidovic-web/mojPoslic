'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { ConditionalHeader } from '@/components/core/conditional-header'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProfileSettingsCard } from '@/components/settings/profile-settings-card'
import { AccountInfoCard } from '@/components/settings/account-info-card'
import { SecurityCard } from '@/components/settings/security-card'
import { PrivacySettingsCard } from '@/components/settings/privacy-settings-card'
import { AppearanceCard } from '@/components/settings/appearance-card'
import { HelpSupportCard } from '@/components/settings/help-support-card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { NextIntlClientProvider } from 'next-intl'

// Helper function to load all translation messages for a given locale
const loadMessages = async (locale: string) => {
  const messages: Record<string, unknown> = {};
  
  // List of all translation namespaces
  const namespaces = [
    'common', 'dashboard', 'jobs', 'jobPost', 'navigation', 'auth', 'messaging', 
    'profile', 'homepage', 'header', 'filters', 'notifications', 'jobCard', 
    'errors', 'greetings', 'jobApplication', 'settings', 'skills', 'roleSelection', 
    'admin', 'messageTemplates', 'theme', 'purchase'
  ];
  
  // Load all translation files
  for (const namespace of namespaces) {
    try {
      const translation = await import(`../../../translations/${locale}/${namespace}.json`);
      messages[namespace] = translation.default;
    } catch {
      // Silently ignore missing translation files
      console.warn(`Missing translation file: ${locale}/${namespace}.json`);
    }
  }
  
  return messages;
};

interface DeletionRequest {
  scheduledDeletion: string
}

export default function SettingsPage() {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Record<string, unknown>>({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null)

  // Detect locale from domain or default to Bosnian
  const locale = typeof window !== 'undefined' && window.location.hostname.startsWith('en.') ? 'en' : 'bs';

  // Load translations on component mount
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const loadedMessages = await loadMessages(locale);
        setMessages(loadedMessages);
        setTranslationsLoaded(true);
      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslationsLoaded(true); // Still set to true to avoid infinite loading
      }
    };
    
    loadTranslations();
  }, [locale]);

  // Helper functions to access translations
  const t = (key: string) => {
    const keys = key.split('.');
    let value: Record<string, unknown> = messages;
    for (const k of keys) {
      value = (value?.[k] as Record<string, unknown>) || {};
    }
    return (typeof value === 'string' ? value : key);
  };

  const tSettings = (key: string) => t(`settings.${key}`);
  const tCommon = (key: string) => t(`common.${key}`);

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

  // Show loading while translations are loading or auth is loading
  if (loading || !translationsLoaded) {
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
    <NextIntlClientProvider messages={messages} locale={locale}>
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
              <PrivacySettingsCard />
              <AppearanceCard />
              <HelpSupportCard />
            </div>
          </div>
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
