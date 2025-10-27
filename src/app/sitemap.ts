import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mojposlic.com'
  const currentDate = new Date()
  
  // Static pages with Bosnian locale focus
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bs`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bs/jobs`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bs/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bs/auth/login`,
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
      url: `${baseUrl}/jobs?category=${category}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bs/jobs?category=${category}`,
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
    'brčko',
    'prijedor',
    'trebinje',
    'doboj',
    'cazin',
    'gradačac',
    'visoko',
    'goražde',
    'livno',
    'konjic',
    'travnik',
    'jajce',
    'foča',
    'remote'
  ]

  const cityPages = cities.flatMap(city => [
    {
      url: `${baseUrl}/jobs?city=${city}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bs/jobs?city=${city}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }
  ])

  // Add combined city + category pages for major combinations
  const majorCities = ['sarajevo', 'banja-luka', 'tuzla', 'mostar', 'zenica']
  const majorCategories = ['majstorski-radovi', 'it-tehnologije', 'ugostiteljstvo', 'gradjevinarstvo', 'transport']
  
  const combinedPages = majorCities.flatMap(city =>
    majorCategories.flatMap(category => [
      {
        url: `${baseUrl}/jobs?city=${city}&category=${category}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/bs/jobs?city=${city}&category=${category}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }
    ])
  )

  return [...staticPages, ...categoryPages, ...cityPages, ...combinedPages]
}