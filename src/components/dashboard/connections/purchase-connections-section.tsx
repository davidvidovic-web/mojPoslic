'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PurchaseConnections } from '@/components/purchase-connections'

export function PurchaseConnectionsSection() {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)

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
        Need more connections? Purchase additional connects to continue applying and posting.
      </p>
    </div>
  )
}
