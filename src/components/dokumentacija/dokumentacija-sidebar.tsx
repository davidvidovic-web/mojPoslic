'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { KnowledgeBaseCategory } from '@/lib/knowledgebase'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  HelpCircle,
  Search,
  Menu,
  X
} from 'lucide-react'

interface DokumentacijaSidebarProps {
  categories: KnowledgeBaseCategory[]
  className?: string
}



export function DokumentacijaSidebar({ categories, className }: DokumentacijaSidebarProps) {
  const pathname = usePathname()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Auto-expand current category
  useEffect(() => {
    const pathParts = pathname.split('/')
    if (pathParts.length >= 3 && pathParts[1] === 'dokumentacija') {
      const currentCategory = pathParts[2]
      setExpandedCategories(prev => new Set(prev).add(currentCategory))
    }
  }, [pathname])

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categorySlug)) {
        newSet.delete(categorySlug)
      } else {
        newSet.add(categorySlug)
      }
      return newSet
    })
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const isCategoryActive = (categorySlug: string) => {
    return pathname.startsWith(`/dokumentacija/${categorySlug}`)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="pb-4 mb-4 border-b border-border">
          <Link 
            href="/dokumentacija" 
            className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-white transition-colors"
          >
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Dokumentacija</span>
          </Link>
        </div>

        {/* Search - Mobile visible */}
        <div className="pb-4 mb-4 border-b border-border md:hidden">
          <Button
            variant="outline"
            size="sm"
              className="w-full justify-start text-muted-foreground hover:text-white hover:bg-accent transition-colors"
            onClick={() => {
              // Trigger search modal/functionality
              window.dispatchEvent(new CustomEvent('open-search'))
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            <span>Pretraži dokumentaciju...</span>
          </Button>
        </div>

        {/* Categories */}
        <nav className="space-y-1">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.slug)
            const hasArticles = category.articles.length > 0

            return (
              <div key={category.slug}>
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.slug)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between p-3 h-auto font-medium text-left",
                        "hover:bg-accent hover:text-white transition-colors",
                        isCategoryActive(category.slug) && "bg-accent text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{category.name}</span>
                        {hasArticles && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 ml-auto">
                            {category.articles.length}
                          </Badge>
                        )}
                      </div>
                      {hasArticles && (
                        <div className="flex-shrink-0 ml-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  {hasArticles && (
                    <CollapsibleContent className="space-y-1 mt-1">
                      <div className="ml-7 space-y-0.5 border-l border-border/50 pl-3">
                        {category.articles.map((article) => (
                          <Link
                            key={article.slug}
                            href={`/dokumentacija/${category.slug}/${article.slug}`}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start px-3 py-2 h-auto font-normal text-sm",
                                "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                                "transition-all duration-200",
                                isActive(`/dokumentacija/${category.slug}/${article.slug}`) && 
                                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium"
                              )}
                            >
                              <span className="text-sm leading-relaxed">{article.title}</span>
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </div>
            )
          })}
        </nav>

        {/* Footer Links */}
        <div className="pt-4 mt-4 border-t border-border space-y-1">
          <Link href="/podrska">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-white hover:bg-accent/80 transition-colors p-3"
            >
              <HelpCircle className="h-4 w-4 mr-3" />
              <span className="text-sm">Podrška</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Trigger */}
      <Button
        variant="outline"
        size="sm"
        className="md:hidden fixed top-20 left-4 z-40 bg-background shadow-md border hover:bg-accent"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Otvori navigaciju</span>
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-background border-r border-border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold text-foreground">Navigacija</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="hover:bg-accent hover:text-white"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Zatvori navigaciju</span>
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:block w-64 h-screen border-r border-border bg-background/95 backdrop-blur-sm", className)}>
        {sidebarContent}
      </aside>
    </>
  )
}