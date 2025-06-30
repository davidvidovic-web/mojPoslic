import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addUsernameToExistingUsers() {
  try {
    console.log('Adding usernames to existing users...')
    
    // Get all users without usernames
    const users = await prisma.user.findMany({
      where: {
        username: null
      }
    })

    console.log(`Found ${users.length} users without usernames`)

    for (const user of users) {
      // Generate a username based on their name or email
      let baseUsername = user.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 15)

      if (!baseUsername || baseUsername.length < 3) {
        baseUsername = user.email.split('@')[0]
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, '')
          .substring(0, 15)
      }

      // Ensure username is unique
      let username = baseUsername
      let counter = 1
      
      while (true) {
        const existing = await prisma.user.findUnique({
          where: { username }
        })
        
        if (!existing) break
        
        username = `${baseUsername}${counter}`
        counter++
      }

      // Update the user with the new username
      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      })

      console.log(`Updated user ${user.email} with username: ${username}`)
    }

    console.log('Successfully added usernames to all users!')
  } catch (error) {
    console.error('Error adding usernames:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addUsernameToExistingUsers()
