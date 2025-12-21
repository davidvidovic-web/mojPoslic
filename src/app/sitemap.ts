import { MetadataRoute } from 'next'

// Helper function to ensure proper URL encoding for XML
function createSafeUrl(baseUrl: string, path?: string, params?: Record<string, string>): string {
  let url = baseUrl
  if (path) {
    url += path
  }
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value)
    })
    url += '?' + searchParams.toString()
  }
  // XML escape the & characters
  return url.replace(/&/g, '&amp;')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const bsBaseUrl = 'https://mojposlic.com'
  const enBaseUrl = 'https://en.mojposlic.com'
  const currentDate = new Date()
  
  // Static pages for both domains
  const staticPages = [
    // Bosnian domain (mojposlic.com)
    {
      url: bsBaseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${bsBaseUrl}/jobs`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${bsBaseUrl}/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${bsBaseUrl}/auth/signin`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${bsBaseUrl}/dokumentacija`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${bsBaseUrl}/dokumentacija/pocetni-koraci`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${bsBaseUrl}/dokumentacija/za-klijente`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${bsBaseUrl}/dokumentacija/za-radnike`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${bsBaseUrl}/dokumentacija/rjesavanje-problema`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${bsBaseUrl}/podrska`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // English domain (en.mojposlic.com)
    {
      url: enBaseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${enBaseUrl}/jobs`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${enBaseUrl}/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${enBaseUrl}/auth/signin`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${enBaseUrl}/dokumentacija`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${enBaseUrl}/dokumentacija/pocetni-koraci`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${enBaseUrl}/dokumentacija/za-klijente`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${enBaseUrl}/dokumentacija/za-radnike`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${enBaseUrl}/dokumentacija/rjesavanje-problema`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${enBaseUrl}/podrska`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }
  ]

  // Add category pages - main job categories in Bosnia (both locales)
  const categories = [
    'majstorski-radovi',
    'selidbe-transport', 
    'ciscenje-odrzavanje',
    'bastenske-usluge',
    'dostava-kupovina',
    'licna-nega',
    'cuvanje-edukacija',
    'kreativne-usluge',
    'it-tehnologije',
    'dogadjaji-zabava',
    'prevoz-logistika',
    'poslovne-usluge',
    'zdravlje-lepota',
    'ugostiteljstvo',
    'gradjevinarstvo',
    'proizvodnja',
    'poljoprivreda',
    'turizam',
    'finansije'
  ]

  const categoryPages = categories.flatMap(category => [
    {
      url: createSafeUrl(bsBaseUrl, '/jobs', { category }),
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: createSafeUrl(enBaseUrl, '/jobs', { category }),
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }
  ])

  // Add city pages - major cities in Bosnia and Herzegovina (both locales)
  const cities = [
    'sarajevo',
    'banja-luka',
    'tuzla',
    'zenica',
    'mostar',
    'bijeljina',
    'brcko', // Changed from 'brčko' to avoid XML encoding issues
    'prijedor',
    'trebinje',
    'doboj',
    'cazin',
    'gradacac', // Changed from 'gradačac' to avoid XML encoding issues
    'visoko',
    'gorazde', // Changed from 'goražde' to avoid XML encoding issues
    'livno',
    'konjic',
    'travnik',
    'jajce',
    'foca', // Changed from 'foča' to avoid XML encoding issues
    'remote'
  ]

  const cityPages = cities.flatMap(city => [
    {
      url: createSafeUrl(bsBaseUrl, '/jobs', { city }),
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: createSafeUrl(enBaseUrl, '/jobs', { city }),
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }
  ])

  // Add combined city + category pages for major combinations
  const majorCities = ['sarajevo', 'banja-luka', 'tuzla', 'mostar', 'zenica']
  const majorCategories = ['majstorski-radovi', 'it-tehnologije', 'ugostiteljstvo', 'gradjevinarstvo', 'selidbe-transport']
  
  const combinedPages = majorCities.flatMap(city =>
    majorCategories.flatMap(category => [
      {
        url: createSafeUrl(bsBaseUrl, '/jobs', { city, category }),
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: createSafeUrl(enBaseUrl, '/jobs', { city, category }),
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }
    ])
  )

  return [...staticPages, ...categoryPages, ...cityPages, ...combinedPages]
}