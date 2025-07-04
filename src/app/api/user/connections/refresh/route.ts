import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Connections are now refreshed automatically.',
      deprecated: true 
    },
    { status: 410 } // Gone
  )
}