import React from 'react'
import { UnifiedMessagingInterface } from './unified-messaging-interface'

interface ModernMessagingInterfaceProps {
  conversationId?: string
  onClose?: () => void
  className?: string
}

/**
 * @deprecated Use UnifiedMessagingInterface instead
 * This component is maintained for backward compatibility
 */
export function ModernMessagingInterface(props: ModernMessagingInterfaceProps) {
  console.warn('ModernMessagingInterface is deprecated. Please use UnifiedMessagingInterface instead.')
  return <UnifiedMessagingInterface {...props} />
}

export default ModernMessagingInterface
