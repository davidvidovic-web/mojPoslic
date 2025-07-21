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
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Job } from '@/types/job';

// Lazy load the job form to improve initial load time
const LazyMultiStepJobForm = lazy(() => 
  import('@/components/jobs/job-post-form/multi-step-job-form').then(module => ({
    default: module.MultiStepJobForm
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

interface UnifiedJobDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJobPosted?: () => void;
  onJobUpdated?: () => void;
  triggerText?: string;
  onTriggerClick?: () => void;
  children?: React.ReactNode; // For custom trigger
  isEditMode?: boolean;
  initialData?: Partial<Job>;
  jobId?: string;
}

export function UnifiedJobDialog({
  isOpen,
  onOpenChange,
  onJobPosted,
  onJobUpdated,
  triggerText,
  onTriggerClick,
  children,
  isEditMode, // TODO: Pass to MultiStepJobForm when edit mode is implemented
  initialData, // TODO: Pass to MultiStepJobForm when edit mode is implemented
  jobId // TODO: Pass to MultiStepJobForm when edit mode is implemented
}: UnifiedJobDialogProps) {
  const t = useTranslations('jobPost')
  
  const dialogTitle = triggerText || t('title')
  const dialogDescription = t('dialogDescription')
  
  const TriggerComponent = children ? (
    <DialogTrigger asChild>
      {children}
    </DialogTrigger>
  ) : triggerText ? (
    <DialogTrigger asChild>
      <Button
        className="bg-foreground hover:bg-foreground/80 text-background font-bold border-0 transition-all duration-200"
        onClick={onTriggerClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        {triggerText}
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
            <LazyMultiStepJobForm
              onJobPosted={onJobPosted || onJobUpdated}
              showCard={false}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  );
}
