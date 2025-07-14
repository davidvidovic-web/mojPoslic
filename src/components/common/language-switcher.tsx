'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const locales = ['en', 'bs'] as const
const localeNames = {
  en: 'EN',
  bs: 'BS'
} as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  const switchLanguage = (newLocale: string) => {
    // For domain-based routing, we need to redirect to a different domain
    const currentUrl = new URL(window.location.href)
    let newUrl: string

    if (newLocale === 'en') {
      // Switch to English subdomain
      if (currentUrl.hostname === 'localhost') {
        newUrl = `http://en.localhost:${currentUrl.port}${pathname}`
      } else {
        // In production, use your actual domain
        const baseDomain = currentUrl.hostname.replace(/^en\./, '')
        newUrl = `${currentUrl.protocol}//en.${baseDomain}${pathname}`
      }
    } else {
      // Switch to main domain (Bosnian)
      if (currentUrl.hostname === 'en.localhost') {
        newUrl = `http://localhost:${currentUrl.port}${pathname}`
      } else {
        // Remove 'en.' prefix if present
        const baseDomain = currentUrl.hostname.replace(/^en\./, '')
        newUrl = `${currentUrl.protocol}//${baseDomain}${pathname}`
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
