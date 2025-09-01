import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const checkUsernameSchema = z.object({
  username: z.string().min(1, 'Username is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = checkUsernameSchema.parse(body)

    // Check if username exists in the database
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    return NextResponse.json({
      available: !existingUser
    })

  } catch (error) {
    console.error('Check username error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
