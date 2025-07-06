'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PurchaseConnections } from '@/components/common/purchase-connections'

interface PurchaseConnectionsSectionProps {
  userRole?: string
}

export function PurchaseConnectionsSection({ userRole = 'tasker' }: PurchaseConnectionsSectionProps) {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)

  const getDescription = () => {
    switch (userRole) {
      case 'client':
        return 'Need more connections? Purchase additional connects to post multiple jobs daily.'
      case 'company':
        return 'Need more connections? Purchase additional connects to continue posting jobs.'
      case 'tasker':
      default:
        return 'Need more connections? Purchase additional connects to continue applying for professional jobs.'
    }
  }

  return (
    <div className="text-center">
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default"
            className="w-full"
          >
            Purchase Connects
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Connections</DialogTitle>
          </DialogHeader>
          <PurchaseConnections onClose={() => setPurchaseDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      <p className="text-xs text-muted-foreground mt-2">
        {getDescription()}
      </p>
    </div>
  )
}
