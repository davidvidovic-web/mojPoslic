import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteBreadcrumbs } from '@/components/ui/site-breadcrumbs'
import { KnowledgeBaseSearch } from '@/components/knowledge-base-search'
import { DokumentacijaLayout } from '@/components/dokumentacija/dokumentacija-layout'
import { 
  Users, 
  Briefcase, 
  HelpCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'documentation' })
  
  // Determine the correct base URL based on locale
  const baseUrl = locale === 'en' ? 'https://en.mojposlic.com' : 'https://mojposlic.com'
  
  return {
    title: `${t('meta.title')} | mojPoslić`,
    description: t('meta.description'),
    openGraph: {
      title: `${t('meta.title')} | mojPoslić`,
      description: t('meta.description'),
      url: `${baseUrl}/dokumentacija`,
    },
    alternates: {
      canonical: `${baseUrl}/dokumentacija`,
    }
  }
}

export default async function DokumentacijaPage({ params }: Props) {
  const { locale } = await params

  return (
    <DokumentacijaLayout locale={locale as 'bs' | 'en'}>
      <div className="container mx-auto px-4 py-8">
        <SiteBreadcrumbs />
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold">Dokumentacija</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sve što trebate znati o korišćenju mojPoslić platforme
          </p>
          
          {/* Search */}
          <KnowledgeBaseSearch />
        </div>

        {/* Welcome Content */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 mb-12">
            <div className="text-center space-y-4">
              <BookOpen className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-3xl font-bold">Dobrodošli u dokumentaciju</h2>
              <p className="text-lg text-muted-foreground">
                Ovdje možete pronaći sve informacije potrebne za uspješno korišćenje mojPoslić platforme. 
                Koristite navigaciju lijevo da brzo dođete do traženih informacija.
              </p>
            </div>
          </div>

          {/* Quick Start */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Za klijente
                </CardTitle>
                <CardDescription>
                  Naučite kako objaviti posao i pronaći idealnog radnika
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dokumentacija/za-klijente">
                  <Button className="w-full">
                    Počnite ovdje <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Za radnike
                </CardTitle>
                <CardDescription>
                  Otkrijte kako aplicirati na poslove i uspješno ih završiti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dokumentacija/za-radnike">
                  <Button className="w-full">
                    Počnite ovdje <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <section className="text-center bg-muted/30 rounded-lg p-8">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Trebate pomoć?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Naš tim podrške je uvijek spreman pomoći. Kontaktirajte nas za bilo kakve nedoumice.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/podrska">
                <Button>
                  Kontaktiraj podršku
                </Button>
              </Link>
              <Link href="/dokumentacija/rjesavanje-problema">
                <Button variant="outline">
                  Pogledaj ČPP
                </Button>
              </Link>
            </div>
          </section>
        </section>
      </div>
    </DokumentacijaLayout>
  )
}