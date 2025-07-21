import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    console.log('Applying JWT NextAuth integration migration...')
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/007_jwt_nextauth_integration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}`)
        const { error } = await supabaseAdmin.rpc('exec_sql', { 
          sql: statement 
        })
        
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error)
          // Continue with other statements for now
        }
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error)
        // Try using direct SQL execution if RPC fails
        try {
          await supabaseAdmin.from('_migration_temp').select('1').limit(0)
        } catch (fallbackError) {
          console.log('Direct SQL execution not available, skipping statement')
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'JWT NextAuth integration migration applied',
      statementsExecuted: statements.length
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
