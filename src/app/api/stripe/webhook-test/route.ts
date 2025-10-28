import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== WEBHOOK TEST ENDPOINT HIT ===')
  
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    console.log('Body length:', body.length)
    console.log('Signature present:', !!signature)
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook test endpoint working',
      bodyLength: body.length,
      hasSignature: !!signature
    })
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json({ error: 'Webhook test failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook test endpoint is active' })
}