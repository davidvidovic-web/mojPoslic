'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useParams } from 'next/navigation'

interface SearchResult {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  lastUpdated: string
}

export function KnowledgeBaseSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const params = useParams()
  const locale = params.locale as string

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  // Debounce search - moved logic into useEffect to avoid dependency issues
  useEffect(() => {
    const searchArticles = async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setShowResults(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/knowledgebase/search?q=${encodeURIComponent(searchQuery)}&locale=${locale}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      searchArticles(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, locale])

  return (
    <div className="relative max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Pretražite dokumentaciju..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Pretraživanje...
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <Link 
                  key={`${result.category}-${result.slug}`}
                  href={`/dokumentacija/${result.category}/${result.slug}`}
                  onClick={clearSearch}
                >
                  <div className="p-3 hover:bg-muted rounded-lg cursor-pointer">
                    <h4 className="font-semibold text-sm mb-1">{result.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {result.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {result.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {result.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Nema rezultata za &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}