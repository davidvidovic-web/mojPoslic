import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsersWithoutUsername() {
  try {
    const usersWithoutUsername = await prisma.user.findMany({
      where: {
        username: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true
      }
    })

    console.log(`Found ${usersWithoutUsername.length} users without usernames:`)
    usersWithoutUsername.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`)
    })

    const totalUsers = await prisma.user.count()
    console.log(`\nTotal users: ${totalUsers}`)
    console.log(`Users with usernames: ${totalUsers - usersWithoutUsername.length}`)
    console.log(`Users without usernames: ${usersWithoutUsername.length}`)

  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsersWithoutUsername()
