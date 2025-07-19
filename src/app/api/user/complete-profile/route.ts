import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function PATCH() {
  const prisma = new PrismaClient()
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mark profile setup as completed
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileSetupCompleted: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile setup status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
