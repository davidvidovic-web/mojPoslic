import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'mojPoslić - Platforma za male poslove',
    short_name: 'mojPoslić - Mali poslovi',
    description: 'Brza platforma za male poslove u BiH. Majstorski radovi, dostava, čišćenje, baštenske usluge i kratki zadaci po potrebi.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#000000',
    lang: 'bs-BA',
    scope: '/',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
        purpose: 'any'
      }
    ],
    categories: ['business', 'employment', 'productivity', 'social'],
    shortcuts: [
      {
        name: 'Pretraži male poslove',
        short_name: 'Mali poslovi',
        description: 'Pretražite dostupne male poslove u BiH',
        url: '/jobs',
        icons: [{ src: '/favicon.ico', sizes: '32x32' }]
      },
      {
        name: 'Objavi mali posao',
        short_name: 'Objavi',
        description: 'Objavite novi oglas za mali posao',
        url: '/dashboard',
        icons: [{ src: '/favicon.ico', sizes: '32x32' }]
      }
    ],
    // screenshots: [] // Removed until actual screenshots are available
  }
}