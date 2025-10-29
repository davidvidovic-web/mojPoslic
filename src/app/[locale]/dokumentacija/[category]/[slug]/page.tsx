import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteBreadcrumbs } from '@/components/ui/site-breadcrumbs'
import { getArticle, getArticleNavigation, getAllCategories } from '@/lib/knowledgebase'
import { DokumentacijaLayout } from '@/components/dokumentacija/dokumentacija-layout'
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  Tag,
  User,
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
  params: Promise<{ locale: string; category: string; slug: string }>
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, slug } = await params
  const article = await getArticle(locale as 'bs' | 'en', category, slug)
  
  if (!article) {
    return {
      title: 'Članak nije pronađen | mojPoslić',
    }
  }
  
  // Determine the correct base URL based on locale
  const baseUrl = locale === 'en' ? 'https://en.mojposlic.com' : 'https://mojposlic.com'
  
  return {
    title: `${article.title} | mojPoslić`,
    description: article.description,
    openGraph: {
      title: `${article.title} | mojPoslić`,
      description: article.description,
      url: `${baseUrl}/dokumentacija/${category}/${slug}`,
    },
    alternates: {
      canonical: `${baseUrl}/dokumentacija/${category}/${slug}`,
    }
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, category, slug } = await params
  const article = await getArticle(locale as 'bs' | 'en', category, slug)
  const navigation = await getArticleNavigation(locale as 'bs' | 'en', category, slug)
  const categories = await getAllCategories(locale as 'bs' | 'en')
  const categoryInfo = categories.find(cat => cat.slug === category)

  if (!article || !categoryInfo) {
    notFound()
  }

  const IconComponent = iconMap[categoryInfo.icon as keyof typeof iconMap] || BookOpen

  return (
    <DokumentacijaLayout locale={locale as 'bs' | 'en'}>
      <div className="container mx-auto px-4 py-8">
        <SiteBreadcrumbs />
        
        {/* Back button */}
        <div className="mb-6">
          <Link href={`/dokumentacija/${category}`}>
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all duration-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nazad na {categoryInfo.name}
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <Link 
                href={`/dokumentacija/${category}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {categoryInfo.name}
              </Link>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{article.description}</p>
            
            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Ažurirano: {new Date(article.lastUpdated).toLocaleDateString('bs-BA')}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-8">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none mb-12">
            <div 
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="
                [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h1]:mt-8
                [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-4 [&>h2]:mt-8
                [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3 [&>h3]:mt-6
                [&>p]:mb-4 [&>p]:leading-relaxed
                [&>ul]:mb-4 [&>ul]:ml-6 [&>ul]:list-disc
                [&>ol]:mb-4 [&>ol]:ml-6 [&>ol]:list-decimal
                [&>li]:mb-1
                [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6
                [&>code]:bg-muted [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm
                [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-6
                [&>hr]:my-8 [&>hr]:border-border
                [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80
                [&>table]:w-full [&>table]:border-collapse [&>table]:my-6
                [&>table_th]:border [&>table_th]:border-border [&>table_th]:p-2 [&>table_th]:bg-muted [&>table_th]:font-semibold
                [&>table_td]:border [&>table_td]:border-border [&>table_td]:p-2
              "
            />
          </div>

          {/* Article Navigation */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {navigation.prev && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-2">Prethodni članak</div>
                  <Link 
                    href={`/dokumentacija/${category}/${navigation.prev.slug}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    <div className="flex items-center">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {navigation.prev.title}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
            
            {navigation.next && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-2">Sljedeći članak</div>
                  <Link 
                    href={`/dokumentacija/${category}/${navigation.next.slug}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    <div className="flex items-center justify-end md:justify-start">
                      {navigation.next.title}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Help Section */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">Trebate dodatnu pomoć?</h3>
              <p className="text-muted-foreground mb-6">
                Ako ovaj članak nije odgovorio na vaša pitanja, naš tim podrške je spreman pomoći.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/podrska">
                  <Button>
                    Kontaktiraj podršku
                  </Button>
                </Link>
                <Link href="/dokumentacija">
                  <Button variant="outline">
                    Nazad na dokumentaciju
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DokumentacijaLayout>
  )
}