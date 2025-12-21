import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/profile/',
          '/settings/',
          '/messaging/',
          '/auth/verify',
          '/auth/reset-password',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/', 
          '/profile/',
          '/settings/',
          '/messaging/',
          '/auth/verify',
          '/auth/reset-password',
        ],
      },
    ],
    sitemap: 'https://mojposlic.com/sitemap.xml',
  }
}