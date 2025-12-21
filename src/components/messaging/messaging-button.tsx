import React from 'react'
import { ModernMessagingButton } from './modern-messaging-button'

interface MessagingButtonProps {
  conversationId?: string
  className?: string
  iconOnly?: boolean
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
}

/**
 * @deprecated Use ModernMessagingButton instead
 * This component is maintained for backward compatibility
 */
export function MessagingButton(props: MessagingButtonProps) {
  console.warn('MessagingButton is deprecated. Please use ModernMessagingButton instead.')
  const { iconOnly, ...rest } = props
  return <ModernMessagingButton {...rest} iconOnly={iconOnly}>{iconOnly ? undefined : 'Message'}</ModernMessagingButton>
}

export default MessagingButton
