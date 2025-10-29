import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SiteBreadcrumbs } from '@/components/ui/site-breadcrumbs'
import { SupportForm } from '@/components/support-form'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'support' })
  
  // Determine the correct base URL based on locale
  const baseUrl = locale === 'en' ? 'https://en.mojposlic.com' : 'https://mojposlic.com'
  
  return {
    title: `${t('meta.title')} | mojPoslić`,
    description: t('meta.description'),
    openGraph: {
      title: `${t('meta.title')} | mojPoslić`,
      description: t('meta.description'),
      url: `${baseUrl}/podrska`,
    },
    alternates: {
      canonical: `${baseUrl}/podrska`,
    }
  }
}

export default async function PodrskaPage({ params }: Props) {
  await params

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <SiteBreadcrumbs />
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold">Podrška</h1>
        </div>

        {/* Support Form */}
        <section className="max-w-2xl mx-auto">
          <SupportForm />
        </section>
      </div>
    </div>
  )
}