'use client'

import React, { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Job } from '@/types/job';

// Lazy load the job edit form to improve initial load time
const LazyJobEditForm = lazy(() => 
  import('@/components/jobs/job-post-form/job-edit-form').then(module => ({
    default: module.JobEditForm
  }))
);

function JobFormSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-32 w-full bg-muted animate-pulse rounded" />
    </div>
  );
}

interface JobEditDialogProps {
  job: Job
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJobUpdated?: () => void;
  triggerText?: string;
  onTriggerClick?: () => void;
  children?: React.ReactNode; // For custom trigger
}

export function JobEditDialog({
  job,
  isOpen,
  onOpenChange,
  onJobUpdated,
  triggerText,
  onTriggerClick,
  children
}: JobEditDialogProps) {
  const t = useTranslations('jobPost')
  
  const dialogTitle = triggerText || `Edit ${job.title}`
  const dialogDescription = t('editDialogDescription') || 'Update your job posting details.'
  
  const TriggerComponent = children ? (
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
  ) : triggerText ? (
    <DialogTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        onClick={onTriggerClick}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </DialogTrigger>
  ) : null
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {TriggerComponent}
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto thin-scrollbar p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        {isOpen && (
          <Suspense fallback={<JobFormSkeleton />}>
            <LazyJobEditForm
              job={job}
              onJobUpdated={() => {
                onJobUpdated?.()
                onOpenChange(false)
              }}
              onCancel={() => onOpenChange(false)}
              showCard={false}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}
