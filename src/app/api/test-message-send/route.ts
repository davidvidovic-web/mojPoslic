import { NextResponse } from 'next/server'
import { MessageService } from '@/lib/messaging/message-service'
import { auth } from '@/lib/auth'

export async function POST() {
  try {
    console.log('Testing message sending...')
    
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }
    
    // Test with a known conversation ID
    const conversationId = 'ce8ba5417530508641da44dcaa37d'
    
    const message = await MessageService.sendMessage({
      conversationId: conversationId,
      content: 'Test message from API endpoint',
      messageType: 'text'
    }, session.user.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: message.id,
      conversationId,
      content: message.content
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
