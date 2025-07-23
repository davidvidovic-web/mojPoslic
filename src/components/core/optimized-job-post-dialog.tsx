import React from 'react';
import { UnifiedJobDialog } from './unified-job-dialog';

interface OptimizedJobPostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJobPosted: () => void;
  triggerText: string;
  dialogTitle?: string; // Optional since we handle it in UnifiedJobDialog
  onTriggerClick: () => void;
  mobileIconOnly?: boolean;
}

export function OptimizedJobPostDialog({
  isOpen,
  onOpenChange,
  onJobPosted,
  triggerText,
  onTriggerClick,
  mobileIconOnly = false
}: OptimizedJobPostDialogProps) {
  return (
    <UnifiedJobDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onJobPosted={onJobPosted}
      triggerText={triggerText}
      onTriggerClick={onTriggerClick}
      isEditMode={false}
      mobileIconOnly={mobileIconOnly}
    />
  );
}
