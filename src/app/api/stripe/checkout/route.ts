import { NextRequest, NextResponse } from 'next/server'
import { #getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, getPackageById } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set. Checkout cannot function.')
      return NextResponse.json(
        { error: 'Stripe not properly configured' }, 
        { status: 500 }
      )
    }

    const session = await #getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packageId } = await request.json()
    
    if (!packageId) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    const connectionPackage = getPackageById(packageId)
    
    if (!connectionPackage) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: connectionPackage.currency,
            product_data: {
              name: connectionPackage.name,
              description: connectionPackage.description,
            },
            unit_amount: Math.round(connectionPackage.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        packageId: connectionPackage.id,
        connections: connectionPackage.connections.toString(),
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
