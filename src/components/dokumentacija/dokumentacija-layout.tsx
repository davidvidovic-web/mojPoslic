import { getAllCategories } from '@/lib/knowledgebase'
import { DokumentacijaSidebar } from '@/components/dokumentacija/dokumentacija-sidebar'

interface DokumentacijaLayoutProps {
  children: React.ReactNode
  locale: 'bs' | 'en'
}

export async function DokumentacijaLayout({ children, locale }: DokumentacijaLayoutProps) {
  const categories = await getAllCategories(locale)

  return (
    <div className="h-screen bg-background flex">
      <DokumentacijaSidebar categories={categories} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}