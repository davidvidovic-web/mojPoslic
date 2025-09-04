'use client'

import React from 'react'
import { useDialogStore } from '@/stores/dialog-store'
import { UnifiedMessagingInterface } from '@/components/messaging/unified-messaging-interface'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function GlobalDialogs() {
  const { 
    isMessagingDialogOpen, 
    closeMessagingDialog, 
    currentConversationId 
  } = useDialogStore()
  
  const t = useTranslations('messaging')

  return (
    <>
      {/* Messaging Dialog */}
      <Dialog open={isMessagingDialogOpen} onOpenChange={() => closeMessagingDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          <UnifiedMessagingInterface 
            conversationId={currentConversationId || undefined}
            onClose={undefined}
            className="h-[70vh] max-w-none border-0 rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
