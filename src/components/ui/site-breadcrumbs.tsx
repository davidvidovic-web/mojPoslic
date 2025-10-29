'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

export function SiteBreadcrumbs() {
  const pathname = usePathname()
  const t = useTranslations('navigation')

  // Generate breadcrumb items based on pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Always add home
    breadcrumbs.push({
      label: t('home'),
      href: '/'
    })

    // Map common paths to translated labels
    const pathLabels: Record<string, string> = {
      'auth': t('auth.title'),
      'signin': t('auth.signin'),
      'register': t('auth.register'),
      'dokumentacija': 'Dokumentacija',
      'podrska': 'Podrška',
      'jobs': t('jobs'),
      'dashboard': t('dashboard'),
      'settings': t('settings'),
      'connections': t('connections'),
      // Documentation categories
      'pocetni-koraci': 'Početni koraci',
      'za-klijente': 'Za klijente',
      'za-radnike': 'Za radnike',
      'placanja': 'Plaćanja',
      'sigurnost': 'Sigurnost',
      'politike': 'Politike',
      'rjesavanje-problema': 'Rješavanje problema',
      // Common article slugs
      'kreiranje-racuna': 'Kreiranje računa',
      'dobrodosli': 'Dobrodošli',
      'kako-objaviti-posao': 'Kako objaviti posao',
      'kako-aplicirati': 'Kako aplicirati',
      'kako-se-placaju': 'Kako se plaćaju usluge',
      'sigurnost-racuna': 'Sigurnost računa',
      'uslovi-koristenja': 'Uslovi korištenja',
      'politika-privatnosti': 'Politika privatnosti',
      'cesti-problemi': 'Česti problemi'
    }

    let currentPath = ''
    
    pathSegments.forEach((segment, index) => {
      // Skip locale segment
      if (index === 0 && (segment === 'bs' || segment === 'en')) {
        return
      }

      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1

      // Convert slug to natural language
      const getDisplayLabel = (slug: string): string => {
        if (pathLabels[slug]) {
          return pathLabels[slug]
        }
        
        // Convert kebab-case to title case
        return slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      breadcrumbs.push({
        label: getDisplayLabel(segment),
        href: currentPath,
        current: isLast
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on homepage
  if (breadcrumbs.length <= 1) {
    return null
  }

  // Determine base URL based on pathname locale (SSR-friendly)
  const getBaseUrl = () => {
    // Determine based on pathname locale for consistent SSR/client rendering
    const isEnglish = pathname.startsWith('/en')
    return isEnglish ? 'https://en.mojposlic.com' : 'https://mojposlic.com'
  }

  // Generate JSON-LD structured data for breadcrumbs
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${getBaseUrl()}${item.href}`
    }))
  }

  return (
    <>
      {/* JSON-LD Structured Data for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
      
      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
        {breadcrumbs.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
            
            {item.current ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}