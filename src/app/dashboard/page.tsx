"use client";

import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import type { AuthUser } from "@/contexts/supabase-auth-context";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { TaskerDashboard } from "@/components/dashboard/tasker-dashboard";
import { RegistrationFlowGuard } from "@/components/auth/registration-flow-guard";
import { ConditionalHeader } from "@/components/core/conditional-header";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState, useCallback } from "react";
import { toast } from "sonner";
import { NextIntlClientProvider } from "next-intl";

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

type DashboardContentProps = {
  user: AuthUser | null;
  loading: boolean;
  messages: Record<string, unknown>;
};

function DashboardContent({ user, loading, messages }: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const tDashboard = useCallback((key: string) => t(`dashboard.${key}`), [t]);

  // Handle payment-related toasts based on search params
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success(tDashboard("notifications.paymentSuccessful"));
      // Clean up URL
      router.replace("/dashboard");
    } else if (payment === "cancelled") {
      toast.error(tDashboard("notifications.paymentCancelled"));
      // Clean up URL
      router.replace("/dashboard");
    }
  }, [searchParams, router, tDashboard]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {tDashboard("loading.dashboard")}
          </p>
        </div>
      </div>
    );
  }

  // RoleGuard ensures user exists and has role + completed setup, so we can safely access user
  if (!user) {
    return null; // This shouldn't happen due to RoleGuard, but keep for safety
  }

  // Render role-specific dashboard with admin override
  const dashboardView = searchParams.get("view") || "default";

  // Admin can access any dashboard view
  if (user.role === "admin") {
    switch (dashboardView) {
      case "client":
        return <ClientDashboard />;
      case "tasker":
        return <TaskerDashboard />;
      case "admin":
      default:
        return <AdminDashboard />;
    }
  }

  // Regular users get their role-specific dashboard
  switch (user.role) {
    case "client":
      return <ClientDashboard />;
    case "tasker":
      return <TaskerDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {t("errors.unknownUserRole")}
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
}

export default function DashboardPage() {
  const { user, loading } = useSupabaseAuth();
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

  // Determine the appropriate loading message based on user role
  const getLoadingMessage = () => {
    if (user?.role) {
      return tDashboard(`loading.${user.role}`);
    }
    return tDashboard("loading.dashboard");
  };

  // Show loading while translations are loading or auth is loading
  if (loading || !translationsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {/* Hardcoded in Bosnian - translations not yet loaded */}
            {translationsLoaded ? getLoadingMessage() : 'Učitavanje...'}
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
                <p className="text-muted-foreground">{getLoadingMessage()}</p>
              </div>
            </div>
          }
        >
          <DashboardContent user={user} loading={false} messages={messages} />
        </Suspense>
      </RegistrationFlowGuard>
    </NextIntlClientProvider>
  );
}
