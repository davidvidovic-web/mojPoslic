'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { Button } from '@/components/ui/button'

const locales = ['bs', 'en'] as const
const localeNames = {
  en: 'EN',
  bs: 'BS'
} as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const { user } = useSupabaseAuth()

  const switchLanguage = async (newLocale: string) => {
    if (user) {
      // If user is logged in, use secure transfer method
      await secureLanguageTransfer(newLocale)
    } else {
      // If user is not logged in, just redirect
      redirectToLanguage(newLocale)
    }
  }

  const secureLanguageTransfer = async (newLocale: string) => {
    try {
      // Create transfer token
      const response = await fetch('/api/auth/create-transfer-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetLanguage: newLocale,
          redirectPath: pathname
        }),
      })

      if (response.ok) {
        const { redirectUrl } = await response.json()
        // Redirect to the transfer endpoint which will handle authentication
        window.location.href = redirectUrl
      } else {
        console.error('Failed to create transfer token')
        // Fallback to simple redirect
        redirectToLanguage(newLocale)
      }
    } catch (error) {
      console.error('Error during secure transfer:', error)
      // Fallback to simple redirect
      redirectToLanguage(newLocale)
    }
  }

  const redirectToLanguage = (newLocale: string) => {
    // For domain-based routing, we need to redirect to a different domain
    const currentUrl = new URL(window.location.href)
    let newUrl: string

    if (newLocale === 'en') {
      // Switch to English subdomain
      if (process.env.NODE_ENV === 'development') {
        if (currentUrl.hostname === 'localhost') {
          newUrl = `http://en.localhost:${currentUrl.port}${pathname}`
        } else {
          newUrl = `http://en.localhost:3000${pathname}`
        }
      } else {
        // Production: switch to en.mojposlic.com
        const baseDomain = currentUrl.hostname.replace(/^en\./, '')
        if (baseDomain === 'mojposlic.com') {
          newUrl = `${currentUrl.protocol}//en.mojposlic.com${pathname}`
        } else {
          newUrl = `${currentUrl.protocol}//en.${baseDomain}${pathname}`
        }
      }
    } else {
      // Switch to main domain (Bosnian)
      if (process.env.NODE_ENV === 'development') {
        if (currentUrl.hostname === 'en.localhost') {
          newUrl = `http://localhost:${currentUrl.port}${pathname}`
        } else {
          newUrl = `http://localhost:3000${pathname}`
        }
      } else {
        // Production: switch to mojposlic.com
        if (currentUrl.hostname === 'en.mojposlic.com') {
          newUrl = `${currentUrl.protocol}//mojposlic.com${pathname}`
        } else {
          // Remove 'en.' prefix if present
          const baseDomain = currentUrl.hostname.replace(/^en\./, '')
          newUrl = `${currentUrl.protocol}//${baseDomain}${pathname}`
        }
      }
    }

    // Redirect to the new domain
    window.location.href = newUrl
  }

  return (
    <div className="flex gap-1 rounded-md border p-1">
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLanguage(loc)}
          className="h-7 px-2 text-xs"
        >
          {localeNames[loc]}
        </Button>
      ))}
    </div>
  )
}
