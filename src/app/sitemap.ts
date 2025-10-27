import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mojposlic.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  ]

  // Add category pages - main job categories in Bosnia
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
    'zdravlje-lepota'
  ]

  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/jobs?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Add city pages - major cities in Bosnia and Herzegovina
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
    'remote'
  ]

  const cityPages = cities.map(city => ({
    url: `${baseUrl}/jobs?city=${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...cityPages]
}