import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPackageById } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Use the webhook secret or provide instructions if missing
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export async function POST(request: NextRequest) {
  // Add detailed logging for debugging
  console.log('Webhook received at:', new Date().toISOString())
  
  try {
    // Check if Stripe is properly configured
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not set. Webhook cannot function.')
      return NextResponse.json(
        { error: 'Stripe not properly configured' }, 
        { status: 500 }
      )
    }
    
    const body = await request.text()
    console.log('Webhook request body length:', body.length)
    
    // Get the signature from request headers directly
    const signature = request.headers.get('stripe-signature')
    console.log('Stripe signature present:', !!signature)

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
      console.log('Webhook event type:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      console.log('Processing checkout.session.completed event')
      const session = event.data.object
      console.log('Session metadata:', JSON.stringify(session.metadata))
      
      const { userId, packageId, connections } = session.metadata || {}

      if (!userId || !connections) {
        console.error('Missing metadata in checkout session:', session.metadata)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

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

        console.log(`Updating user ${userId} with ${connectionsAmount} connections`)
        
        // First, check if the user exists
        const userExistsResult = await prisma.$queryRaw`
          SELECT id, connections FROM users WHERE id = ${userId}
        ` as Array<{ id: string; connections: number }>
        
        if (!userExistsResult || userExistsResult.length === 0) {
          console.error(`User ${userId} not found in database`)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        
        const currentConnections = userExistsResult[0].connections
        console.log(`User ${userId} current connections: ${currentConnections}`)
        
        // Update the user's connections using raw SQL to avoid TypeScript issues
        const updateResult = await prisma.$executeRaw`
          UPDATE users 
          SET connections = connections + ${connectionsAmount} 
          WHERE id = ${userId}
        `
        
        console.log(`Update query affected ${updateResult} rows`)
        
        // Get the updated user data to verify the update worked
        const updatedUserResult = await prisma.$queryRaw`
          SELECT id, name, email, connections
          FROM users 
          WHERE id = ${userId}
        ` as Array<{ id: string; name: string; email: string; connections: number }>
        
        const updatedUser = updatedUserResult[0]
        
        console.log('User updated successfully:', JSON.stringify(updatedUser))
        console.log(`Connections changed from ${currentConnections} to ${updatedUser.connections}`)
        
        // Verify the update actually happened
        if (updatedUser.connections !== currentConnections + connectionsAmount) {
          console.error(`Connection update failed! Expected: ${currentConnections + connectionsAmount}, Got: ${updatedUser.connections}`)
          return NextResponse.json({ 
            error: 'Connection update verification failed',
            expected: currentConnections + connectionsAmount,
            actual: updatedUser.connections
          }, { status: 500 })
        }
        
        // Log this payment event so we can manually recover if needed
        console.log('PAYMENT_SUCCESS', JSON.stringify({
          userId,
          connections: connectionsAmount,
          packageId,
          sessionId: session.id,
          timestamp: new Date().toISOString()
        }))
        
        // Try to create history entry but don't fail the whole operation if it doesn't work
        try {
          // Create connection history using raw SQL to avoid TypeScript issues
          const historyResult = await prisma.$queryRaw`
            INSERT INTO connection_history (id, user_id, action, amount, description, created_at)
            VALUES (gen_random_uuid(), ${userId}, 'PURCHASE'::"ConnectionAction", ${connectionsAmount}, ${packageDescription}, NOW())
            RETURNING id, action, amount, description, created_at
          ` as Array<{ id: string; action: string; amount: number; description: string; created_at: Date }>
          
          console.log('Connection history created:', JSON.stringify(historyResult[0]))
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

        console.log(`Successfully added ${connectionsAmount} connections to user ${userId}`)
        
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
      console.log(`Ignoring event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, eventType: event.type })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error', details: error }, { status: 500 })
  }
}
