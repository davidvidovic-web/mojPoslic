const { PrismaClient } = require('@prisma/client')

async function checkCategories() {
  const prisma = new PrismaClient()
  
  try {
    const categories = await prisma.category.findMany({
      take: 10,
      select: {
        id: true,
        key: true,
        nameEN: true,
        isActive: true
      }
    })
    
    console.log('Categories in database:')
    categories.forEach(cat => {
      console.log(`  ${cat.id} | ${cat.key} | ${cat.nameEN} | active: ${cat.isActive}`)
    })
    
    const totalCount = await prisma.category.count()
    console.log(`\nTotal categories: ${totalCount}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()
