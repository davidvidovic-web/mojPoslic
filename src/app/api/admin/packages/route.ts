import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Read current package configuration from the stripe.ts file
    const stripePath = path.join(process.cwd(), 'src/lib/stripe.ts')
    const stripeContent = await fs.readFile(stripePath, 'utf-8')
    
    // Extract CONNECTION_PACKAGES from the file
    const packagesMatch = stripeContent.match(/CONNECTION_PACKAGES = \[([\s\S]*?)\] as const/)
    
    if (!packagesMatch) {
      return NextResponse.json({ error: 'Could not parse packages' }, { status: 500 })
    }

    // Parse the packages (simplified approach)
    const { CONNECTION_PACKAGES } = await import('@/lib/stripe')
    
    return NextResponse.json({ packages: CONNECTION_PACKAGES })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { packages } = await request.json()

    // Validate packages
    if (!Array.isArray(packages) || packages.length !== 4) {
      return NextResponse.json({ error: 'Invalid packages data' }, { status: 400 })
    }

    // Validate each package
    for (const pkg of packages) {
      if (!pkg.id || !pkg.connections || !pkg.price || !pkg.name || !pkg.description) {
        return NextResponse.json({ error: 'Missing package fields' }, { status: 400 })
      }
      if (typeof pkg.connections !== 'number' || typeof pkg.price !== 'number') {
        return NextResponse.json({ error: 'Invalid package field types' }, { status: 400 })
      }
    }

    // Update the stripe.ts file
    const stripePath = path.join(process.cwd(), 'src/lib/stripe.ts')
    const stripeContent = await fs.readFile(stripePath, 'utf-8')
    
    // Generate the new packages array
    const packagesString = packages.map(pkg => `  {
    id: '${pkg.id}',
    connections: ${pkg.connections},
    price: ${pkg.price},
    currency: '${pkg.currency || 'eur'}',
    name: '${pkg.name}',
    description: '${pkg.description}'
  }`).join(',\n')

    // Replace the CONNECTION_PACKAGES in the file
    const newContent = stripeContent.replace(
      /CONNECTION_PACKAGES = \[([\s\S]*?)\] as const/,
      `CONNECTION_PACKAGES = [\n${packagesString}\n] as const`
    )

    await fs.writeFile(stripePath, newContent, 'utf-8')

    return NextResponse.json({ success: true, message: 'Packages updated successfully' })
  } catch (error) {
    console.error('Error updating packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
