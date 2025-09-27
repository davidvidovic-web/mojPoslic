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

interface Category extends CategoryBase {
  icon?: string;
  is_popular?: boolean;
  subcategories?: Subcategory[];
}

interface CategoriesData {
  lastUpdated: string;
  version: string;
  totalCount: number;
  categories: MainCategory[];
}

// Function to flatten categories with their subcategories
function flattenCategories(data: CategoriesData): { lastUpdated: string; version: string; totalCount: number; categories: Category[] } {
  const flatCategories: Category[] = [];
  
  if (data.categories && Array.isArray(data.categories)) {
    for (const category of data.categories) {
      // Add main category
      const mainCategory = {
        ...category,
        // Remove subcategories from main category to avoid confusion
        subcategories: undefined
      };
      flatCategories.push(mainCategory);
      
      // Add subcategories as separate entries with parent_id
      if (category.subcategories && Array.isArray(category.subcategories)) {
        for (const subcategory of category.subcategories) {
          flatCategories.push({
            ...subcategory,
            parent_id: category.id // Ensure parent_id is set correctly
          });
        }
      }
    }
  }
  
  return {
    ...data,
    categories: flatCategories
  };
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'static', 'categories.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Flatten the categories structure
    const flattenedData = flattenCategories(data);
    
    return NextResponse.json(flattenedData, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'Content-Type': 'application/json',
        'X-API-Version': '2.1.0', // Increment version to bust cache
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
