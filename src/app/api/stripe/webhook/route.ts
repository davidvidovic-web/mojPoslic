import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPackageById } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  try {
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe not properly configured' }, 
        { status: 500 }
      )
    }
    
    const buf = await request.arrayBuffer()
    const body = Buffer.from(buf)
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' }, 
        { status: 500 }
      )
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { userId, packageId, connections } = session.metadata || {}

      if (!userId || !connections) {
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      const connectionsAmount = parseInt(connections, 10)
      if (isNaN(connectionsAmount)) {
        return NextResponse.json({ error: 'Invalid connections amount' }, { status: 400 })
      }

      try {
        const connectionPackage = packageId ? getPackageById(packageId) : null
        const packageDescription = connectionPackage 
          ? `Purchase of ${connectionPackage.name} (${connectionPackage.connections} connections)`
          : `Purchase of ${connectionsAmount} connections`

        const { data: existingUser, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, connections, name, email')
          .eq('id', userId)
          .maybeSingle()
        
        if (userError) {
          return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
        }
        
        if (!existingUser) {
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
          
          if (authError || !authUser.user) {
            return NextResponse.json({ error: 'User not found in auth system' }, { status: 404 })
          }
          
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              id: userId,
              email: authUser.user.email || '',
              name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
              connections: connectionsAmount,
              created_at: new Date().toISOString()
            })
            .select('id, connections, name, email')
            .single()
          
          if (createError || !newUser) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
          }
          
          try {
            await supabaseAdmin
              .from('connection_history')
              .insert({
                user_id: userId,
                action: 'PURCHASE',
                connections_before: 0,
                connections_after: connectionsAmount,
                amount_changed: connectionsAmount,
                reason: packageDescription
              })
          } catch {
            // Continue even if history creation fails
          }
          
          return NextResponse.json({ 
            success: true, 
            message: `Created new user ${userId} with ${connectionsAmount} connections`,
            user: newUser
          })
        }
        
        const currentConnections = existingUser.connections || 0
        
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ connections: currentConnections + connectionsAmount })
          .eq('id', userId)
        
        if (updateError) {
          return NextResponse.json({ 
            error: 'Connection update failed',
            details: updateError
          }, { status: 500 })
        }
        
        const { data: updatedUser, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('id, name, email, connections')
          .eq('id', userId)
          .single()
        
        if (fetchError || !updatedUser) {
          return NextResponse.json({ error: 'Failed to fetch updated user' }, { status: 500 })
        }
        
        try {
          await supabaseAdmin
            .from('connection_history')
            .insert({
              user_id: userId,
              action: 'PURCHASE',
              connections_before: currentConnections,
              connections_after: currentConnections + connectionsAmount,
              amount_changed: connectionsAmount,
              reason: packageDescription
            })
        } catch {
          // Continue even if history creation fails
        }

        return NextResponse.json({ 
          success: true, 
          message: `Added ${connectionsAmount} connections to user ${userId}`,
          user: updatedUser
        })
      } catch (dbError) {
        return NextResponse.json({ error: 'Database operation failed', details: dbError }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true, eventType: event.type })
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error', details: error }, { status: 500 })
  }
}
