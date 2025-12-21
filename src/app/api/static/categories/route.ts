import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CategoryBase {
  id: string;
  key: string;
  name_bs: string;
  name_en: string;
  name: string;
  description: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

interface MainCategory extends CategoryBase {
  icon: string;
  is_popular: boolean;
  subcategories?: Subcategory[];
}

interface Subcategory extends CategoryBase {
  icon?: string;
  is_popular?: boolean;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'static', 'categories.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Transform subcategories to children for component compatibility
    const hierarchicalData = {
      ...data,
      categories: data.categories.map((category: MainCategory) => ({
        ...category,
        // Add children property from subcategories for component compatibility
        children: category.subcategories || [],
        // Keep subcategories for backwards compatibility
        subcategories: category.subcategories || []
      }))
    };
    
    return NextResponse.json(hierarchicalData, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'Content-Type': 'application/json',
        'X-API-Version': '2.2.0', // Increment version to bust cache
      },
    });
  } catch (error) {
    console.error('Error reading categories.json:', error);
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    );
  }
}
