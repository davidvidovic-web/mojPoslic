import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

interface AdminCategory {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isPopular: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  name_en?: string
  name_bs?: string
  is_popular?: boolean
  sort_order?: number
  is_active?: boolean
  created_at?: string
}

// GET - Get all categories for admin management
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const categories = await prisma.$queryRaw`
      SELECT * FROM categories 
      ORDER BY sort_order ASC, name_en ASC
    ` as AdminCategory[]

    // Transform the data to match our interface
    const transformedCategories = categories.map(cat => ({
      id: cat.id,
      key: cat.key,
      nameEN: cat.nameEN || cat.name_en,
      nameBS: cat.nameBS || cat.name_bs,
      isPopular: cat.isPopular || cat.is_popular,
      sortOrder: cat.sortOrder || cat.sort_order,
      isActive: cat.isActive !== false,
      createdAt: cat.createdAt || cat.created_at
    }))

    return NextResponse.json(transformedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { key, nameEN, nameBS, isPopular, sortOrder, isActive } = await request.json()

    if (!key || !nameEN || !nameBS) {
      return NextResponse.json(
        { error: 'Key, English name, and Bosnian name are required' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existingCategory = await prisma.$queryRaw`
      SELECT * FROM categories WHERE key = ${key} LIMIT 1
    ` as AdminCategory[]

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Category with this key already exists' },
        { status: 400 }
      )
    }

    const newCategory = await prisma.$queryRaw`
      INSERT INTO categories (id, key, name_en, name_bs, is_popular, sort_order, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${key}, ${nameEN}, ${nameBS}, ${isPopular || false}, ${sortOrder || 999}, ${isActive !== false}, NOW(), NOW())
      RETURNING *
    ` as AdminCategory[]

    return NextResponse.json(newCategory[0], { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id, key, nameEN, nameBS, isPopular, sortOrder, isActive } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const updatedCategory = await prisma.$queryRaw`
      UPDATE categories 
      SET key = ${key}, name_en = ${nameEN}, name_bs = ${nameBS}, 
          is_popular = ${isPopular}, sort_order = ${sortOrder}, 
          is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    ` as AdminCategory[]

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('id')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Check if category is in use
    const jobCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM job_listings WHERE category_id = ${categoryId}
    ` as { count: bigint }[]

    if (Number(jobCount[0]?.count || 0) > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is used by ${Number(jobCount[0]?.count || 0)} job(s).` },
        { status: 400 }
      )
    }

    await prisma.$queryRaw`
      DELETE FROM categories WHERE id = ${categoryId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
