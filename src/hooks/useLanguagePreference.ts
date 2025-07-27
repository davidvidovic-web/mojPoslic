import { useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useLocale } from 'next-intl';

export function useLanguagePreference() {
  const { user } = useSupabaseAuth();
  const currentLocale = useLocale();

  useEffect(() => {
    // Only redirect if user is logged in and has a language preference different from current locale
    if (user?.preferredLanguage && user.preferredLanguage !== currentLocale) {
      const currentUrl = new URL(window.location.href);
      const baseDomain = currentUrl.hostname.replace(/^en\./, '');
      
      let targetUrl: string;
      
      if (user.preferredLanguage === 'en') {
        // User prefers English, redirect to en subdomain
        targetUrl = `${currentUrl.protocol}//en.${baseDomain}${currentUrl.pathname}${currentUrl.search}`;
      } else {
        // User prefers Bosnian, redirect to main domain
        targetUrl = `${currentUrl.protocol}//${baseDomain}${currentUrl.pathname}${currentUrl.search}`;
      }
      
      // Only redirect if we're not already on the correct domain
      if (targetUrl !== currentUrl.href) {
        window.location.href = targetUrl;
      }
    }
  }, [user?.preferredLanguage, currentLocale]);
}
