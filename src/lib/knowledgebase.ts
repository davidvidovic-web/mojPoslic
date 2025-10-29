import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

export interface KnowledgeBaseArticle {
  slug: string
  title: string
  description: string
  category: string
  order: number
  tags: string[]
  lastUpdated: string
  author: string
  content: string
}

export interface KnowledgeBaseCategory {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  order: number
  articles: KnowledgeBaseArticle[]
}

const knowledgeBasePath = path.join(process.cwd(), 'docs/knowledgebase')

// Category metadata with Bosnian-first slugs and English fallbacks
const categoryMetadata: Record<string, Omit<KnowledgeBaseCategory, 'slug' | 'articles'>> = {
  // Bosnian-first slugs
  'pocetni-koraci': {
    name: 'Početni koraci',
    description: 'Osnovne informacije za nove korisnike',
    icon: 'BookOpen',
    color: 'blue',
    order: 1
  },
  'za-klijente': {
    name: 'Za klijente',
    description: 'Vodič za postavljanje poslova i zapošljavanje',
    icon: 'Users',
    color: 'green',
    order: 2
  },
  'za-radnike': {
    name: 'Za radnike',
    description: 'Vodič za pronalaženje i izvršavanje zadataka',
    icon: 'Briefcase',
    color: 'purple',
    order: 3
  },
  'placanja': {
    name: 'Plaćanja',
    description: 'Načini plaćanja, naplate i transakcije',
    icon: 'CreditCard',
    color: 'yellow',
    order: 4
  },
  'sigurnost': {
    name: 'Sigurnost',
    description: 'Sigurnost, privatnost i zaštita',
    icon: 'Shield',
    color: 'red',
    order: 5
  },
  'politike': {
    name: 'Politike',
    description: 'Uslovi korištenja, privatnost i smjernice',
    icon: 'FileText',
    color: 'gray',
    order: 6
  },
  'rjesavanje-problema': {
    name: 'Rješavanje problema',
    description: 'Česti problemi i rješenja',
    icon: 'HelpCircle',
    color: 'orange',
    order: 7
  }
}

// English category metadata - uses same Bosnian-first slugs but English names
const categoryMetadataEn: Record<string, Omit<KnowledgeBaseCategory, 'slug' | 'articles'>> = {
  // Bosnian-first slugs with English names
  'pocetni-koraci': {
    name: 'Getting Started',
    description: 'Essential information for new users',
    icon: 'BookOpen',
    color: 'blue',
    order: 1
  },
  'za-klijente': {
    name: 'For Clients',
    description: 'Guide for posting jobs and hiring',
    icon: 'Users',
    color: 'green',
    order: 2
  },
  'za-radnike': {
    name: 'For Taskers',
    description: 'Guide for finding and completing tasks',
    icon: 'Briefcase',
    color: 'purple',
    order: 3
  },
  'placanja': {
    name: 'Payments',
    description: 'Payment methods, billing, and transactions',
    icon: 'CreditCard',
    color: 'yellow',
    order: 4
  },
  'sigurnost': {
    name: 'Security',
    description: 'Safety, privacy, and security measures',
    icon: 'Shield',
    color: 'red',
    order: 5
  },
  'politike': {
    name: 'Policies',
    description: 'Terms of service, privacy policy, and guidelines',
    icon: 'FileText',
    color: 'gray',
    order: 6
  },
  'rjesavanje-problema': {
    name: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: 'HelpCircle',
    color: 'orange',
    order: 7
  }
}

// Process markdown content
async function processMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)
  
  return result.toString()
}

// Get all articles for a specific locale and category
export async function getArticlesByCategory(locale: 'bs' | 'en', category: string): Promise<KnowledgeBaseArticle[]> {
  const categoryPath = path.join(knowledgeBasePath, locale, category)
  
  if (!fs.existsSync(categoryPath)) {
    return []
  }

  const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'))
  const articles: KnowledgeBaseArticle[] = []

  for (const file of files) {
    const filePath = path.join(categoryPath, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    
    const processedContent = await processMarkdown(content)
    
    articles.push({
      slug: file.replace('.md', ''),
      title: data.title || 'Untitled',
      description: data.description || '',
      category: data.category || category,
      order: data.order || 999,
      tags: data.tags || [],
      lastUpdated: data.lastUpdated || '',
      author: data.author || 'mojPoslić Team',
      content: processedContent
    })
  }

  // Sort by order
  return articles.sort((a, b) => a.order - b.order)
}

// Get single article
export async function getArticle(locale: 'bs' | 'en', category: string, slug: string): Promise<KnowledgeBaseArticle | null> {
  const filePath = path.join(knowledgeBasePath, locale, category, `${slug}.md`)
  
  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  
  const processedContent = await processMarkdown(content)
  
  return {
    slug,
    title: data.title || 'Untitled',
    description: data.description || '',
    category: data.category || category,
    order: data.order || 999,
    tags: data.tags || [],
    lastUpdated: data.lastUpdated || '',
    author: data.author || 'mojPoslić Team',
    content: processedContent
  }
}

// Get all categories with articles
export async function getAllCategories(locale: 'bs' | 'en'): Promise<KnowledgeBaseCategory[]> {
  const localePath = path.join(knowledgeBasePath, locale)
  
  if (!fs.existsSync(localePath)) {
    return []
  }

  const categoryDirs = fs.readdirSync(localePath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  const categories: KnowledgeBaseCategory[] = []
  const metadata = locale === 'en' ? categoryMetadataEn : categoryMetadata

  for (const categorySlug of categoryDirs) {
    const articles = await getArticlesByCategory(locale, categorySlug)
    const categoryInfo = metadata[categorySlug]
    
    if (categoryInfo && articles.length > 0) {
      categories.push({
        slug: categorySlug,
        ...categoryInfo,
        articles
      })
    }
  }

  // Sort by order
  return categories.sort((a, b) => a.order - b.order)
}

// Search articles
export async function searchArticles(locale: 'bs' | 'en', query: string): Promise<KnowledgeBaseArticle[]> {
  const categories = await getAllCategories(locale)
  const allArticles = categories.flatMap(cat => cat.articles)
  
  const searchQuery = query.toLowerCase()
  
  return allArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery) ||
    article.description.toLowerCase().includes(searchQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
    article.content.toLowerCase().includes(searchQuery)
  )
}

// Get article navigation (prev/next)
export async function getArticleNavigation(locale: 'bs' | 'en', category: string, currentSlug: string) {
  const articles = await getArticlesByCategory(locale, category)
  const currentIndex = articles.findIndex(article => article.slug === currentSlug)
  
  return {
    prev: currentIndex > 0 ? articles[currentIndex - 1] : null,
    next: currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null
  }
}