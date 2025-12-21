import { NextRequest, NextResponse } from 'next/server'
import { searchArticles } from '@/lib/knowledgebase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const locale = searchParams.get('locale')

  if (!query || !locale) {
    return NextResponse.json({ error: 'Missing query or locale parameter' }, { status: 400 })
  }

  if (locale !== 'bs' && locale !== 'en') {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  try {
    const results = await searchArticles(locale, query)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}