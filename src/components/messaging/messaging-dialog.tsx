import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MessagingInterface } from './messaging-interface'

interface MessagingDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  conversationId?: string
  title?: string
}

export function MessagingDialog({ 
  isOpen, 
  onOpenChange, 
  conversationId,
  title = 'Messages'
}: MessagingDialogProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 p-6 pt-0">
          <MessagingInterface 
            conversationId={conversationId}
            onClose={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
