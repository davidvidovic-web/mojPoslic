import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteBreadcrumbs } from '@/components/ui/site-breadcrumbs'
import { getArticlesByCategory, getAllCategories } from '@/lib/knowledgebase'
import { DokumentacijaLayout } from '@/components/dokumentacija/dokumentacija-layout'
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  Tag,
  BookOpen,
  Users,
  Briefcase,
  CreditCard,
  Shield,
  FileText,
  HelpCircle,
  Settings
} from 'lucide-react'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ locale: string; category: string }>
}

// Icon mapping
const iconMap = {
  'BookOpen': BookOpen,
  'Users': Users,
  'Briefcase': Briefcase,
  'CreditCard': CreditCard,
  'Shield': Shield,
  'FileText': FileText,
  'HelpCircle': HelpCircle,
  'Settings': Settings
}

// Color mapping
const colorMap = {
  'blue': 'text-blue-600',
  'green': 'text-green-600',
  'purple': 'text-purple-600',
  'yellow': 'text-yellow-600',
  'red': 'text-red-600',
  'gray': 'text-gray-600',
  'orange': 'text-orange-600'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params
  const categories = await getAllCategories(locale as 'bs' | 'en')
  const categoryInfo = categories.find(cat => cat.slug === category)
  
  if (!categoryInfo) {
    return {
      title: 'Kategorija nije pronađena | mojPoslić',
    }
  }
  
  // Determine the correct base URL based on locale
  const baseUrl = locale === 'en' ? 'https://en.mojposlic.com' : 'https://mojposlic.com'
  
  return {
    title: `${categoryInfo.name} - Dokumentacija | mojPoslić`,
    description: categoryInfo.description,
    openGraph: {
      title: `${categoryInfo.name} - Dokumentacija | mojPoslić`,
      description: categoryInfo.description,
      url: `${baseUrl}/dokumentacija/${category}`,
    },
    alternates: {
      canonical: `${baseUrl}/dokumentacija/${category}`,
    }
  }
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category } = await params
  const articles = await getArticlesByCategory(locale as 'bs' | 'en', category)
  const categories = await getAllCategories(locale as 'bs' | 'en')
  const categoryInfo = categories.find(cat => cat.slug === category)

  if (!categoryInfo || articles.length === 0) {
    notFound()
  }

  const IconComponent = iconMap[categoryInfo.icon as keyof typeof iconMap] || BookOpen
  const colorClass = colorMap[categoryInfo.color as keyof typeof colorMap] || 'text-primary'

  return (
    <DokumentacijaLayout locale={locale as 'bs' | 'en'}>
      <div className="container mx-auto px-4 py-8">
        <SiteBreadcrumbs />
        
        {/* Back button */}
        <div className="mb-6">
          <Link href="/dokumentacija">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nazad na dokumentaciju
            </Button>
          </Link>
        </div>

        {/* Category Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center mb-4">
            <IconComponent className={`h-16 w-16 ${colorClass}`} />
          </div>
          <h1 className="text-4xl font-bold">{categoryInfo.name}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {categoryInfo.description}
          </p>
        </div>

        {/* Articles List */}
        <section className="mb-16">
          <div className="grid gap-6">
            {articles.map((article, index) => (
              <Card key={article.slug} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        <Link 
                          href={`/dokumentacija/${category}/${article.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {article.description}
                      </CardDescription>
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground/20 ml-4">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Tags */}
                  {article.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Ažurirano: {new Date(article.lastUpdated).toLocaleDateString('bs-BA')}</span>
                      </div>
                      <span>•</span>
                      <span>{article.author}</span>
                    </div>
                  </div>

                  {/* Read more button */}
                  <Link href={`/dokumentacija/${category}/${article.slug}`}>
                    <Button variant="outline">
                      Pročitaj članak <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DokumentacijaLayout>
  )
}