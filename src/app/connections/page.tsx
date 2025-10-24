"use client";

import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ConnectionsFullHistory } from '@/components/dashboard/connections/connections-full-history'
import { ConnectionsWidget } from '@/components/dashboard/connections/connections-widget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RegistrationFlowGuard } from '@/components/auth/registration-flow-guard'
import { ConditionalHeader } from '@/components/core/conditional-header'
import { NextIntlClientProvider } from 'next-intl'
import { useState, useEffect, Suspense, useCallback } from 'react'

// Helper function to load all translation messages for a given locale
const loadMessages = async (locale: string) => {
  const messages: Record<string, unknown> = {};

  // List of all translation namespaces
  const namespaces = [
    "common",
    "dashboard",
    "jobs",
    "jobPost",
    "navigation",
    "auth",
    "messaging",
    "profile",
    "homepage",
    "header",
    "filters",
    "notifications",
    "jobCard",
    "errors",
    "greetings",
    "jobApplication",
    "settings",
    "skills",
    "roleSelection",
    "admin",
    "messageTemplates",
    "theme",
    "purchase",
  ];

  // Load all translation files
  for (const namespace of namespaces) {
    try {
      const translation = await import(
        `../../../translations/${locale}/${namespace}.json`
      );
      messages[namespace] = translation.default;
    } catch {
      // Silently ignore missing translation files
      console.warn(`Missing translation file: ${locale}/${namespace}.json`);
    }
  }

  return messages;
};

type ConnectionsContentProps = {
  messages: Record<string, unknown>;
};

function ConnectionsContent({ messages }: ConnectionsContentProps) {
  const { user } = useSupabaseAuth();

  // Helper functions to access translations
  const t = useCallback(
    (key: string) => {
      const keys = key.split(".");
      let value: Record<string, unknown> = messages;
      for (const k of keys) {
        value = (value?.[k] as Record<string, unknown>) || {};
      }
      return typeof value === "string" ? value : key;
    },
    [messages]
  );

  const tNavigation = useCallback((key: string) => t(`navigation.main.${key}`), [t]);
  const tDashboard = useCallback((key: string) => t(`dashboard.${key}`), [t]);

  return (
    <DashboardLayout 
      userRole={user?.role as 'client' | 'tasker' | 'company' | 'admin'}
      userName={user?.name}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {tNavigation('connections')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tDashboard('connections.description')}
          </p>
        </div>

        {/* Connection Balance Widget */}
        <ConnectionsWidget />

        {/* Full Connection History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {tDashboard('connections.fullHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionsFullHistory />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function ConnectionsPage() {
  const { loading } = useSupabaseAuth();
  const [messages, setMessages] = useState<Record<string, unknown>>({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // Detect locale from domain or default to Bosnian
  const locale =
    typeof window !== "undefined" && window.location.hostname.startsWith("en.")
      ? "en"
      : "bs";

  // Load translations on component mount
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const loadedMessages = await loadMessages(locale);
        setMessages(loadedMessages);
        setTranslationsLoaded(true);
      } catch (error) {
        console.error("Failed to load translations:", error);
        setTranslationsLoaded(true); // Still set to true to avoid infinite loading
      }
    };

    loadTranslations();
  }, [locale]);

  // Helper functions to access translations
  const t = (key: string) => {
    const keys = key.split(".");
    let value: Record<string, unknown> = messages;
    for (const k of keys) {
      value = (value?.[k] as Record<string, unknown>) || {};
    }
    return typeof value === "string" ? value : key;
  };

  const tDashboard = (key: string) => t(`dashboard.${key}`);

  // Show loading while translations are loading or auth is loading
  if (loading || !translationsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {/* Hardcoded in Bosnian - translations not yet loaded */}
            {translationsLoaded ? tDashboard('loading.dashboard') : 'Učitavanje...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <RegistrationFlowGuard>
        <ConditionalHeader />
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{tDashboard('loading.dashboard')}</p>
              </div>
            </div>
          }
        >
          <ConnectionsContent messages={messages} />
        </Suspense>
      </RegistrationFlowGuard>
    </NextIntlClientProvider>
  );
}
