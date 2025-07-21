import { NextResponse } from 'next/server'
import { MessageService } from '@/lib/messaging/message-service'

export async function GET() {
  try {
    console.log('Testing message fetching...')
    
    // Test with a known conversation ID
    const conversationId = 'ce8ba5417530508641da44dcaa37d'
    
    const messages = await MessageService.getMessages(conversationId, 10)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message fetching working',
      conversationId,
      messageCount: messages.length,
      messages: messages.slice(0, 3) // Just show first 3 for testing
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
