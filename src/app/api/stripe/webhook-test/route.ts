import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  console.log('TEST WEBHOOK: Received request at:', new Date().toISOString())
  
  try {
    const body = await request.text()
    console.log('TEST WEBHOOK: Request body length:', body.length)
    
    let event
    try {
      event = JSON.parse(body)
      console.log('TEST WEBHOOK: Event type:', event.type)
    } catch (err) {
      console.error('TEST WEBHOOK: Failed to parse JSON:', err)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      console.log('TEST WEBHOOK: Processing checkout.session.completed event')
      const session = event.data.object
      console.log('TEST WEBHOOK: Session metadata:', JSON.stringify(session.metadata))
      
      const { userId, packageId, connections } = session.metadata || {}

      if (!userId || !connections) {
        console.error('TEST WEBHOOK: Missing metadata in checkout session:', session.metadata)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      const connectionsAmount = parseInt(connections, 10)
      if (isNaN(connectionsAmount)) {
        console.error('TEST WEBHOOK: Invalid connections amount:', connections)
        return NextResponse.json({ error: 'Invalid connections amount' }, { status: 400 })
      }

      try {
        console.log(`TEST WEBHOOK: Updating user ${userId} with ${connectionsAmount} connections`)
        
        // First, check if the user exists
        const userExistsResult = await prisma.$queryRaw`
          SELECT id, connections FROM users WHERE id = ${userId}
        ` as Array<{ id: string; connections: number }>
        
        if (!userExistsResult || userExistsResult.length === 0) {
          console.error(`TEST WEBHOOK: User ${userId} not found in database`)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        
        const currentConnections = userExistsResult[0].connections
        console.log(`TEST WEBHOOK: User ${userId} current connections: ${currentConnections}`)
        
        // Update the user's connections
        const updateResult = await prisma.$executeRaw`
          UPDATE users 
          SET connections = connections + ${connectionsAmount} 
          WHERE id = ${userId}
        `
        
        console.log(`TEST WEBHOOK: Update query affected ${updateResult} rows`)
        
        // Get the updated user data to verify the update worked
        const updatedUserResult = await prisma.$queryRaw`
          SELECT id, name, email, connections
          FROM users 
          WHERE id = ${userId}
        ` as Array<{ id: string; name: string; email: string; connections: number }>
        
        const updatedUser = updatedUserResult[0]
        console.log('TEST WEBHOOK: User updated successfully:', JSON.stringify(updatedUser))
        console.log(`TEST WEBHOOK: Connections changed from ${currentConnections} to ${updatedUser.connections}`)
        
        // Verify the update actually happened
        if (updatedUser.connections !== currentConnections + connectionsAmount) {
          console.error(`TEST WEBHOOK: Connection update failed! Expected: ${currentConnections + connectionsAmount}, Got: ${updatedUser.connections}`)
          return NextResponse.json({ 
            error: 'Connection update verification failed',
            expected: currentConnections + connectionsAmount,
            actual: updatedUser.connections
          }, { status: 500 })
        }
        
        // Create connection history
        try {
          const packageDescription = `Test purchase of ${connectionsAmount} connections`
          
          const historyResult = await prisma.$queryRaw`
            INSERT INTO connection_history (id, user_id, action, amount, description, created_at)
            VALUES (gen_random_uuid(), ${userId}, 'PURCHASE', ${connectionsAmount}, ${packageDescription}, NOW())
            RETURNING id, action, amount, description, created_at
          ` as Array<{ id: string; action: string; amount: number; description: string; created_at: Date }>
          
          console.log('TEST WEBHOOK: Connection history created:', JSON.stringify(historyResult[0]))
        } catch (historyError) {
          console.error('TEST WEBHOOK: Failed to create connection history:', historyError)
        }

        console.log(`TEST WEBHOOK: Successfully added ${connectionsAmount} connections to user ${userId}`)
        
        return NextResponse.json({ 
          success: true, 
          message: `TEST WEBHOOK: Added ${connectionsAmount} connections to user ${userId}`,
          user: updatedUser
        })
      } catch (dbError) {
        console.error('TEST WEBHOOK: Database operation failed:', dbError)
        return NextResponse.json({ error: 'Database operation failed', details: dbError }, { status: 500 })
      }
    } else {
      console.log(`TEST WEBHOOK: Ignoring event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, eventType: event.type })
  } catch (error) {
    console.error('TEST WEBHOOK: Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error', details: error }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
