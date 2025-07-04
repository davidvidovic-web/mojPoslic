import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user: session.user }, { status: 200 })
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}