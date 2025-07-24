import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'static', 'cities.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading cities.json:', error);
    return NextResponse.json(
      { error: 'Failed to load cities' },
      { status: 500 }
    );
  }
}
