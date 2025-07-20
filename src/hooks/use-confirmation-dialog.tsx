'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText: string
  cancelText: string
  variant?: 'default' | 'destructive'
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  options: ConfirmationOptions
}

function ConfirmationDialog({ isOpen, onClose, onConfirm, options }: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          <DialogDescription>{options.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {options.cancelText}
          </Button>
          <Button 
            variant={options.variant || 'default'} 
            onClick={handleConfirm}
          >
            {options.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null)

  const showConfirmation = useCallback((
    confirmationOptions: ConfirmationOptions,
    confirmCallback: () => void
  ) => {
    setOptions(confirmationOptions)
    setOnConfirm(() => confirmCallback)
    setIsOpen(true)
  }, [])

  const hideConfirmation = useCallback(() => {
    setIsOpen(false)
    setOptions(null)
    setOnConfirm(null)
  }, [])

  const ConfirmationDialogComponent = useCallback(() => {
    if (!options || !onConfirm) return null

    return (
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={onConfirm}
        options={options}
      />
    )
  }, [isOpen, options, onConfirm, hideConfirmation])

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent
  }
}
