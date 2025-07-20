import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPackageById } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'

// Use the webhook secret or provide instructions if missing
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
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

        
        // First, check if the user exists
        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, connections: true }
        })
        
        if (!existingUser) {
          console.error(`User ${userId} not found in database`)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        
        const currentConnections = existingUser.connections
        
        // Update the user's connections using Prisma
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { connections: { increment: connectionsAmount } },
          select: { id: true, name: true, email: true, connections: true }
        })
        
        
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
        console.log('Payment successful:', {
          userId,
          connections: connectionsAmount,
          packageId,
          sessionId: session.id,
          timestamp: new Date().toISOString()
        })
        
        // Try to create history entry but don't fail the whole operation if it doesn't work
        try {
          // Create connection history using raw SQL to avoid TypeScript issues
          await prisma.$queryRaw`
            INSERT INTO connection_history (id, user_id, action, amount, description, created_at)
            VALUES (gen_random_uuid(), ${userId}, 'PURCHASE'::"ConnectionAction", ${connectionsAmount}, ${packageDescription}, NOW())
            RETURNING id, action, amount, description, created_at
          `
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
  } finally {
    await prisma.$disconnect()
  }
}
