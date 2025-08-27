'use client'

import React, { useState, useEffect } from 'react'
import { MessagingInterface } from './messaging-interface'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useScrollLockCompensation } from '@/hooks/useScrollLockCompensation'

/**
 * Simple messaging button that opens MessagingInterface in a modal
 */
interface MessagingButtonProps {
  conversationId?: string
  className?: string
  iconOnly?: boolean
}

export function MessagingButton({ conversationId, className, iconOnly = false }: MessagingButtonProps) {
  const { user } = useSupabaseAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Use the specialized scroll lock compensation hook
  useScrollLockCompensation()

  // Enhanced scroll lock and keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow
      const originalPosition = document.body.style.position
      
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'relative'
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
        }
      }
      
      // Prevent scroll on modal backdrop
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault()
      }
      
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('wheel', handleWheel, { passive: false })
      
      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow
        document.body.style.position = originalPosition
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('wheel', handleWheel)
      }
    }
  }, [isOpen])

  if (!user) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={iconOnly ? 
          `${className} justify-center` : 
          (className || "flex items-center gap-2")
        }
      >
        <MessageCircle className="h-4 w-4" />
        {!iconOnly && "Messages"}
      </Button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setIsOpen(false)}
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <div 
              className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl ring-1 ring-border/50 overflow-hidden animate-in zoom-in-95 duration-200" 
              onClick={(e) => e.stopPropagation()}
              style={{ height: '600px', maxHeight: '90vh' }}
            >
              <MessagingInterface 
                conversationId={conversationId}
                onClose={() => setIsOpen(false)}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
