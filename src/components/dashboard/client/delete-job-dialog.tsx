'use client'

import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DeleteJobDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  jobTitle?: string
}

export function DeleteJobDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  jobTitle = "this job"
}: DeleteJobDialogProps) {
  const t = useTranslations('jobs.dialogs')
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('deleteJobDialog')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('deleteJobDescription', { jobTitle })}</p>
              
              {/* Warning Section */}
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm text-destructive">
                  <div className="font-medium mb-1">Ova akcija će trajno:</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Obrisati oglas za posao</li>
                    <li>Ukloniti sve prijave</li>
                    <li>Ova akcija se ne može poništiti</li>
                  </ul>
                  <p className="mt-2 text-xs">Napomena: Poruke će ostati dostupne za pregled.</p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('deleteJobConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}