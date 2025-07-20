/**
 * Process scheduled account deletions
 * This should be run daily via cron job to check for accounts scheduled for deletion
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Process and delete accounts that have reached their scheduled deletion date
 */
export async function processScheduledDeletions(): Promise<{
  success: boolean
  deletedAccounts: number
  errors: string[]
}> {
  const errors: string[] = []
  let deletedAccounts = 0

  try {
    // Get all deletion requests where the scheduled date has passed
    const expiredRequests = await prisma.accountDeletionRequest.findMany({
      where: {
        scheduledDeletion: {
          lte: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    console.log(`Found ${expiredRequests.length} accounts scheduled for deletion`)

    // Process each deletion
    for (const request of expiredRequests) {
      try {
        const user = request.user

        // Skip admin accounts as extra safety measure
        if (user.role === 'admin') {
          console.log(`Skipping admin account deletion: ${user.email}`)
          continue
        }

        // Delete all related data in the correct order using a transaction
        await prisma.$transaction(async (tx) => {
          // 1. Delete connection history
          await tx.connectionHistory.deleteMany({
            where: { userId: user.id }
          })

          // 2. Delete notifications
          await tx.notification.deleteMany({
            where: { userId: user.id }
          })

          // 3. Delete saved jobs
          await tx.savedJob.deleteMany({
            where: { userId: user.id }
          })

          // 4. Delete job views
          await tx.jobView.deleteMany({
            where: { userId: user.id }
          })

          // 5. Delete reviews (both given and received)
          await tx.review.deleteMany({
            where: { 
              OR: [
                { reviewerId: user.id },
                { revieweeId: user.id }
              ]
            }
          })

          // 6. Delete messages sent by user
          await tx.message.deleteMany({
            where: { senderId: user.id }
          })

          // 7. Delete conversations where user is a participant
          await tx.conversation.deleteMany({
            where: {
              OR: [
                { participant1: user.id },
                { participant2: user.id }
              ]
            }
          })

          // 8. Delete job assignments for jobs posted by this user
          const userJobs = await tx.jobListing.findMany({
            where: { postedById: user.id },
            select: { id: true }
          })

          for (const job of userJobs) {
            await tx.jobAssignment.deleteMany({
              where: { jobId: job.id }
            })
          }

          // 9. Delete applications
          await tx.application.deleteMany({
            where: { userId: user.id }
          })

          // 10. Delete job listings posted by this user
          await tx.jobListing.deleteMany({
            where: { postedById: user.id }
          })

          // 11. Delete Stripe transactions
          await tx.stripeTransaction.deleteMany({
            where: { userId: user.id }
          })

          // 12. Delete sessions and accounts (NextAuth)
          await tx.session.deleteMany({
            where: { userId: user.id }
          })

          await tx.account.deleteMany({
            where: { userId: user.id }
          })

          // 13. Delete the deletion request
          await tx.accountDeletionRequest.delete({
            where: { id: request.id }
          })

          // 14. Finally delete the user
          await tx.user.delete({
            where: { id: user.id }
          })
        })

        deletedAccounts++
        console.log(`Successfully deleted account: ${user.email}`)
      } catch (error) {
        const errorMsg = `Failed to delete account ${request.user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    if (errors.length > 0) {
      console.error(`Encountered ${errors.length} errors during deletion process:`, errors)
    }

    return {
      success: true,
      deletedAccounts,
      errors
    }
  } catch (error) {
    const errorMsg = `Critical error in deletion process: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(errorMsg)
    errors.push(errorMsg)
    
    return {
      success: false,
      deletedAccounts,
      errors
    }
  } finally {
    await prisma.$disconnect()
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  processScheduledDeletions()
    .then((result) => {
      console.log(`Deletion process completed. Deleted ${result.deletedAccounts} accounts.`)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
