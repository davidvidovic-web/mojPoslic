import { NextResponse } from 'next/server'

// DISABLED: This file previously used Prisma but the project uses Supabase.
// The static JSON files are already generated and maintained elsewhere.
// This endpoint is no longer functional and should be removed from cache-utils.ts

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Cache update endpoint is disabled. Static files are maintained separately.' 
    },
    { status: 501 }
  )
}

export async function POST() {
  return NextResponse.json(
    { 
      error: 'Cache update endpoint is disabled. Static files are maintained separately.' 
    },
    { status: 501 }
  )
}
