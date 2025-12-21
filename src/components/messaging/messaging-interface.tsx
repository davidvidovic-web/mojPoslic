import React from 'react'
import { UnifiedMessagingInterface } from './unified-messaging-interface'

interface MessagingInterfaceProps {
  conversationId?: string
  onClose?: () => void
  className?: string
}

/**
 * @deprecated Use UnifiedMessagingInterface instead
 * This component is maintained for backward compatibility
 */
export function MessagingInterface(props: MessagingInterfaceProps) {
  console.warn('MessagingInterface is deprecated. Please use UnifiedMessagingInterface instead.')
  return <UnifiedMessagingInterface {...props} />
}

export default MessagingInterface
