import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedStripeTransactions() {
  console.log('🏦 Seeding sample Stripe transactions...')
  
  try {
    // Get some users to create transactions for
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, name: true, email: true }
    })

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.')
      return
    }

    const sampleTransactions = [
      {
        stripePaymentIntentId: 'pi_test_1234567890abcdef',
        userId: users[0].id,
        amount: 999, // $9.99
        currency: 'usd',
        status: 'succeeded',
        description: 'Connection Pack - 10 connections',
        metadata: { package: 'basic', connections: 10 }
      },
      {
        stripePaymentIntentId: 'pi_test_abcdef1234567890',
        userId: users[1]?.id || users[0].id,
        amount: 2499, // $24.99
        currency: 'usd',
        status: 'succeeded',
        description: 'Connection Pack - 25 connections',
        metadata: { package: 'standard', connections: 25 }
      },
      {
        stripePaymentIntentId: 'pi_test_fedcba0987654321',
        userId: users[2]?.id || users[0].id,
        amount: 4999, // $49.99
        currency: 'usd',
        status: 'succeeded',
        description: 'Connection Pack - 50 connections',
        metadata: { package: 'premium', connections: 50 }
      },
      {
        stripePaymentIntentId: 'pi_test_fail1234567890',
        userId: users[3]?.id || users[0].id,
        amount: 999, // $9.99
        currency: 'usd',
        status: 'failed',
        description: 'Connection Pack - 10 connections (failed)',
        metadata: { package: 'basic', connections: 10, error: 'card_declined' }
      },
      {
        stripePaymentIntentId: 'pi_test_pending123456',
        userId: users[4]?.id || users[0].id,
        amount: 1999, // $19.99
        currency: 'usd',
        status: 'pending',
        description: 'Connection Pack - 20 connections (pending)',
        metadata: { package: 'medium', connections: 20 }
      },
      {
        stripePaymentIntentId: 'pi_test_success789012',
        userId: users[0].id,
        amount: 9999, // $99.99
        currency: 'usd',
        status: 'succeeded',
        description: 'Connection Pack - 100 connections',
        metadata: { package: 'enterprise', connections: 100 }
      },
      {
        stripePaymentIntentId: 'pi_test_refund123456',
        userId: users[1]?.id || users[0].id,
        amount: 2499, // $24.99
        currency: 'usd',
        status: 'refunded',
        description: 'Connection Pack - 25 connections (refunded)',
        metadata: { package: 'standard', connections: 25, refund_reason: 'customer_request' }
      }
    ]

    // Create transactions with different dates for variety
    for (let i = 0; i < sampleTransactions.length; i++) {
      const transaction = sampleTransactions[i]
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - (i * 3)) // Spread over different days
      
      await prisma.stripeTransaction.create({
        data: {
          ...transaction,
          createdAt
        }
      })
      
      console.log(`   ✅ Created transaction: ${transaction.stripePaymentIntentId} - ${transaction.status}`)
    }

    console.log(`\n🎉 Successfully created ${sampleTransactions.length} sample Stripe transactions!`)
    
    // Show summary
    const totalSuccess = sampleTransactions.filter(t => t.status === 'succeeded')
    const totalRevenue = totalSuccess.reduce((sum, t) => sum + t.amount, 0)
    console.log(`💰 Total successful revenue: $${(totalRevenue / 100).toFixed(2)}`)
    
  } catch (error) {
    console.error('❌ Error seeding Stripe transactions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding function
seedStripeTransactions().catch(console.error)
