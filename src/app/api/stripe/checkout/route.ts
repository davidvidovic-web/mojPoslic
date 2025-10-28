import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { CONNECTION_PACKAGES } from '@/lib/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set')
      return NextResponse.json(
        { error: 'STRIPE_CONFIG_ERROR', message: 'Payment system not configured' },
        { status: 500 }
      )
    }

    const { packageId } = await request.json()

    if (!packageId) {
      return NextResponse.json(
        { error: 'PACKAGE_ID_REQUIRED', message: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Find the package
    const packageData = CONNECTION_PACKAGES.find(pkg => pkg.id === packageId)
    if (!packageData) {
      return NextResponse.json(
        { error: 'INVALID_PACKAGE_ID', message: 'Invalid package ID' },
        { status: 400 }
      )
    }

    // Get authenticated user - try both Authorization header and cookies
    let user = null
    let authError = null

    // First try Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Stripe checkout auth header:', authHeader ? 'Present' : 'Missing')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const supabaseWithToken = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          cookies: {
            get: () => undefined,
            set: () => {},
            remove: () => {}
          }
        }
      )
      
      const { data: tokenData, error: tokenError } = await supabaseWithToken.auth.getUser()
      if (!tokenError && tokenData?.user) {
        user = tokenData.user
        console.log('Stripe checkout: Auth via header successful, user ID:', user.id)
      } else {
        authError = tokenError
        console.log('Stripe checkout: Auth via header failed:', tokenError?.message)
      }
    }

    // Fallback to cookies if Authorization header didn't work
    if (!user) {
      console.log('Stripe checkout: Trying cookie-based auth...')
      const supabase = await createServerSupabaseClient()
      const { data: cookieData, error: cookieError } = await supabase.auth.getUser()
      user = cookieData?.user
      authError = cookieError
      
      if (user) {
        console.log('Stripe checkout: Auth via cookies successful, user ID:', user.id)
      } else {
        console.log('Stripe checkout: Auth via cookies failed:', cookieError?.message)
      }
    }

    if (authError || !user) {
      console.log('Stripe checkout: Authentication failed, returning 401')
      return NextResponse.json(
        { error: 'AUTHENTICATION_REQUIRED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get base URL with proper scheme
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    // Ensure URL has proper scheme
    const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
    
    console.log('Stripe checkout: Using base URL:', normalizedBaseUrl)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${packageData.connections} Connection Credits`,
              description: `Package of ${packageData.connections} connection credits for mojPoslic`,
            },
            unit_amount: Math.round(packageData.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${normalizedBaseUrl}/dashboard?payment=success`,
      cancel_url: `${normalizedBaseUrl}/dashboard?payment=cancelled`,
      metadata: {
        userId: user.id,
        packageId: packageData.id,
        connections: packageData.connections.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      // Map specific Stripe errors to error codes for better translation
      let errorCode = 'STRIPE_ERROR'
      
      if (error.message.includes('Invalid URL') || error.message.includes('scheme')) {
        errorCode = 'STRIPE_INVALID_URL'
      } else if (error instanceof Stripe.errors.StripeCardError) {
        errorCode = 'STRIPE_CARD_ERROR'
      } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
        errorCode = 'STRIPE_VALIDATION_ERROR'
      }
      
      return NextResponse.json(
        { 
          error: errorCode, 
          message: error.message,
          stripeError: true 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}