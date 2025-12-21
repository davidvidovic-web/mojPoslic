'use client'

import React from 'react'
import { useDialogStore } from '@/stores/dialog-store'
import { UnifiedMessagingInterface } from '@/components/messaging/unified-messaging-interface'
import { JobPostForm } from '@/components/jobs/job-post-form/job-post-form'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function GlobalDialogs() {
  const { 
    isMessagingDialogOpen, 
    closeMessagingDialog, 
    currentConversationId,
    isJobPostDialogOpen,
    closeJobPostDialog
  } = useDialogStore()
  
  const t = useTranslations('messaging')
  const jobT = useTranslations('jobs')

  return (
    <>
      {/* Job Post Dialog */}
      <Dialog open={isJobPostDialogOpen} onOpenChange={() => closeJobPostDialog()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{jobT('postForm.title')}</DialogTitle>
            <DialogDescription>{jobT('postForm.title')}</DialogDescription>
          </DialogHeader>
          <JobPostForm 
            onJobPosted={() => {
              closeJobPostDialog()
            }}
            onCancel={() => closeJobPostDialog()}
            showCard={false}
          />
        </DialogContent>
      </Dialog>

      {/* Messaging Dialog */}
      <Dialog open={isMessagingDialogOpen} onOpenChange={() => closeMessagingDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0 [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('title')}</DialogDescription>
          </DialogHeader>
          <UnifiedMessagingInterface 
            conversationId={currentConversationId || undefined}
            onClose={closeMessagingDialog}
            className="h-[70vh] max-w-none border-0 rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
