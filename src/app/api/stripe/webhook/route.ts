import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPackageById } from '@/lib/stripe'
import { createRouteClient } from '@/lib/supabase/route'

// Use the webhook secret or provide instructions if missing
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export async function POST(request: NextRequest) {
  console.log('=== STRIPE WEBHOOK CALLED ===')
  console.log('Timestamp:', new Date().toISOString())
  
  const supabase = createRouteClient()
  
  try {
    // Check if Stripe is properly configured
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not set. Webhook cannot function.')
      return NextResponse.json(
        { error: 'Stripe not properly configured' }, 
        { status: 500 }
      )
    }
    
    console.log('Stripe configuration OK')
    
    const body = await request.text()
    
    // Get the signature from request headers directly
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Check if webhook secret is configured
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set. Please configure it in your environment variables.')
      return NextResponse.json(
        { error: 'Webhook secret not configured' }, 
        { status: 500 }
      )
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Event type:', event.type)
    
    if (event.type === 'checkout.session.completed') {
      console.log('Processing checkout.session.completed event')
      const session = event.data.object
      
      console.log('Session metadata:', session.metadata)
      const { userId, packageId, connections } = session.metadata || {}

      if (!userId || !connections) {
        console.error('Missing metadata in checkout session:', session.metadata)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }
      
      console.log('Processing purchase for user:', userId, 'connections:', connections)

      const connectionsAmount = parseInt(connections, 10)
      if (isNaN(connectionsAmount)) {
        console.error('Invalid connections amount:', connections)
        return NextResponse.json({ error: 'Invalid connections amount' }, { status: 400 })
      }

      try {
        // Get the package details for the description
        const connectionPackage = packageId ? getPackageById(packageId) : null
        const packageDescription = connectionPackage 
          ? `Purchase of ${connectionPackage.name} (${connectionPackage.connections} connections)`
          : `Purchase of ${connectionsAmount} connections`

        
        // First, check if the user exists
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id, connections')
          .eq('id', userId)
          .single()
        
        if (userError || !existingUser) {
          console.error(`User ${userId} not found in database`, userError)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        
        const currentConnections = existingUser.connections || 0
        
        console.log('Updating connections from', currentConnections, 'to', currentConnections + connectionsAmount)
        
        // Update the user's connections using Supabase
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ connections: currentConnections + connectionsAmount })
          .eq('id', userId)
          .select('id, name, email, connections')
          .single()
        
        if (updateError || !updatedUser) {
          console.error('Connection update failed:', updateError)
          return NextResponse.json({ error: 'Connection update failed' }, { status: 500 })
        }
        
        console.log('Connections updated successfully:', updatedUser.connections)
        
        
        // Verify the update actually happened
        if (updatedUser.connections !== currentConnections + connectionsAmount) {
          console.error(`Connection update failed! Expected: ${currentConnections + connectionsAmount}, Got: ${updatedUser.connections}`)
          return NextResponse.json({ 
            error: 'Connection update verification failed',
            expected: currentConnections + connectionsAmount,
            actual: updatedUser.connections
          }, { status: 500 })
        }
        
        // Try to create history entry but don't fail the whole operation if it doesn't work
        try {
          const { error: historyError } = await supabase
            .from('connection_history')
            .insert({
              user_id: userId,
              action: 'PURCHASE',
              connections_before: currentConnections,
              connections_after: currentConnections + connectionsAmount,
              amount_changed: connectionsAmount,
              reason: packageDescription
            })
          
          if (historyError) {
            throw historyError
          }
        } catch (historyError) {
          console.error('Failed to create connection history:', historyError)
          // Provide very specific error information for debugging
          if (historyError instanceof Error) {
            console.error('Error name:', historyError.name)
            console.error('Error message:', historyError.message)
            console.error('Error stack:', historyError.stack)
          } else {
            console.error('Unknown error type:', typeof historyError)
          }
          // Continue even if history creation fails
        }

        
        return NextResponse.json({ 
          success: true, 
          message: `Added ${connectionsAmount} connections to user ${userId}`,
          user: updatedUser
        })
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        return NextResponse.json({ error: 'Database operation failed', details: dbError }, { status: 500 })
      }
    } else {
    }

    return NextResponse.json({ received: true, eventType: event.type })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error', details: error }, { status: 500 })
  }
}
