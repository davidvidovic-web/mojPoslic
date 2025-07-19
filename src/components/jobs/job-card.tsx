"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  DollarSign,
  Edit,
  Car,
  Star,
  Users,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Job } from "@/types/job";
import {
  getJobTypeBadgeVariant,
  formatTimeAgo,
} from "@/lib/job-utils";
import { useAuth } from "@/contexts/auth-context";
import { MultiStepJobForm } from "@/components/jobs/job-post-form/multi-step-job-form";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';

interface JobCardProps {
  job: Job;
  onJobUpdated?: () => void;
  isSaved?: boolean;
  onSaveToggle?: (jobId: string, isSaved: boolean) => void;
}

export function JobCard({ job, onJobUpdated, isSaved = false, onSaveToggle }: JobCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('jobCard');
  const locale = useLocale();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isJobSaved, setIsJobSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);

  // Check if the current user owns this job
  const isOwner = user && job.posted_by === user.id;

  // Translation functions for job types, transportation, and duration
  const getTranslatedJobType = (type: string): string => {
    const typeKey = type.replace(/[-_]/g, '').toLowerCase();
    switch (typeKey) {
      case 'fulltime': return t('jobTypes.fullTime');
      case 'parttime': return t('jobTypes.partTime');
      case 'remote': return t('jobTypes.remote');
      case 'quickjob': return t('jobTypes.quickJob');
      case 'contract': return t('jobTypes.contract');
      case 'internship': return t('jobTypes.internship');
      case 'freelance': return t('jobTypes.freelance');
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace(/[-_]/g, ' ');
    }
  };

  const getTranslatedTransportation = (transportation?: string, amount?: number): string | null => {
    if (!transportation) return null;
    
    switch (transportation) {
      case 'provided': return t('transportation.provided');
      case 'not_provided': return t('transportation.notProvided');
      case 'employee_responsible':
      case 'tasker_responsible': return t('transportation.taskerResponsible');
      case 'compensated': 
        return amount ? t('transportation.compensated', { amount }) : t('transportation.compensatedGeneral');
      default: return transportation.charAt(0).toUpperCase() + transportation.slice(1).replace(/_/g, ' ');
    }
  };

  const getTranslatedDuration = (duration?: string): string => {
    if (!duration) return '';
    
    // Check if we have a translation for this duration
    try {
      return t(`duration.${duration}`);
    } catch {
      // Fallback to replacing underscores with spaces
      return duration.replace('_', ' ');
    }
  };

  // Update saved state when prop changes
  useEffect(() => {
    setIsJobSaved(isSaved);
  }, [isSaved]);

  // Handle save/unsave job
  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      toast.error(t('signInToSave'));
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      if (isJobSaved) {
        // Unsave the job
        const response = await fetch(`/api/user/saved-jobs?jobId=${job.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsJobSaved(false);
          onSaveToggle?.(job.id, false);
          toast.success(t('jobRemovedFromSaved'));
        } else {
          throw new Error(t('failedToUnsaveJob'));
        }
      } else {
        // Save the job
        const response = await fetch('/api/user/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId: job.id }),
        });

        if (response.ok) {
          setIsJobSaved(true);
          onSaveToggle?.(job.id, true);
          toast.success(t('jobSavedSuccessfully'));
        } else {
          throw new Error(t('failedToSaveJob'));
        }
      }
    } catch (error) {
      console.error('Error toggling job save:', error);
      toast.error(t('jobPost.errors.somethingWentWrong'));
    } finally {
      setIsSaving(false);
    }
  };

  // Check application count for owner's jobs
  const checkApplicationCount = useCallback(async () => {
    if (!isOwner) return;

    try {
      const response = await fetch(`/api/jobs/${job.id}/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplicationCount(data.applicationCount || 0);
      }
    } catch (error) {
      console.error("Error checking application count:", error);
    }
  }, [isOwner, job.id]);

  // Load application count when component mounts
  useEffect(() => {
    if (isOwner) {
      checkApplicationCount();
    }
  }, [isOwner, checkApplicationCount]);

  const canEdit =
    isOwner && (applicationCount === null || applicationCount === 0);

  const formatSalary = (job: Job) => {
    // If we have structured salary data
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString();
      const max = job.salaryMax.toLocaleString();
      const type =
        job.salaryType === "hourly"
          ? t('hourly')
          : job.salaryType === "daily"
            ? t('daily')
            : job.salaryType === "weekly"
              ? t('weekly')
              : job.salaryType === "monthly"
                ? t('monthly')
                : "";
      return `${min}-${max} BAM${type}`;
    }

    // If we only have minimum salary
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString();
      const type =
        job.salaryType === "hourly"
          ? t('hourly')
          : job.salaryType === "daily"
            ? t('daily')
            : job.salaryType === "weekly"
              ? t('weekly')
              : job.salaryType === "monthly"
                ? t('monthly')
                : "";

      // Don't show "From" for fixed prices
      if (job.salaryType === 'fixed') {
        return `${min} BAM`;
      }
      
      return `${t('from')} ${min} BAM${type}`;
    }

    // Fallback to legacy salary field
    return job.salary || null;
  };

  const handleViewDetails = () => {
    router.push(`/jobs/${job.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsEditDialogOpen(true);
  };

  const handleJobUpdated = () => {
    setIsEditDialogOpen(false);
    onJobUpdated?.();
    toast.success(t("jobUpdatedSuccessfully"));
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullDescription(!showFullDescription);
  };

  // Strip HTML tags and get plain text for description
  const getPlainTextDescription = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const plainDescription = getPlainTextDescription(job.description);
  const shouldTruncate = plainDescription.length > 150;
  const truncatedDescription =
    shouldTruncate && !showFullDescription
      ? plainDescription.substring(0, 150) + "..."
      : plainDescription;

  return (
    <Card
      className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer border-border/40"
      onClick={handleViewDetails}
    >
      <CardHeader className="p-4 pb-3">
        {/* 1. Posted time and save button */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs text-muted-foreground">
            {job.posted_at ? formatTimeAgo(job.posted_at) : ''}
          </span>
          <div className="flex items-center gap-2">
            {/* Save button for non-owners and taskers only */}
            {!isOwner && user && user.role === 'tasker' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={isSaving}
                className="h-8 w-8 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
              >
                {isJobSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Bookmark className="h-4 w-4 text-muted-foreground hover:text-emerald-600" />
                )}
              </Button>
            )}
            {/* Application count for owners */}
            {isOwner && applicationCount !== null && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {applicationCount} {t('applied')}
              </Badge>
            )}
          </div>
        </div>

        {/* 2. Title of the post - big font */}
        <h3 className="text-xl font-bold leading-tight mb-2 line-clamp-2">
          {job.title}
        </h3>

        {/* 3. Location, Payment and Duration - inline on same row */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          {/* Location */}
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.city?.name || t('jobTypes.remote')}</span>
          </div>
          
          {/* Payment */}
          {formatSalary(job) && (
            <div className="flex items-center font-medium text-blue-600">
              <DollarSign className="h-4 w-4 mr-1" />
              {formatSalary(job)}
            </div>
          )}

          {/* Duration */}
          {job.duration && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {getTranslatedDuration(job.duration)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0 space-y-3">
        {/* 5. Description - normal font with read more button */}
        <div>
          <div 
            className="text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: truncatedDescription 
            }}
          />
          {shouldTruncate && (
            <button
              onClick={toggleDescription}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
            >
              {showFullDescription ? t('readLess') : t('readMore')}
            </button>
          )}
        </div>

        {/* 5. Bubble tags */}
        <div className="flex flex-wrap gap-2">
          {job.is_featured && (
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              {t('featured')}
            </Badge>
          )}
          
          <Badge variant={getJobTypeBadgeVariant(job.type)} className="text-xs">
            {getTranslatedJobType(job.type)}
          </Badge>

          {job.category && (
            <Badge variant="secondary" className="text-xs">
              {locale === 'bs' ? job.category.name_bs || job.category.name : job.category.name_en || job.category.name}
            </Badge>
          )}

          {job.transportation && (
            <Badge variant="outline" className="text-xs">
              <Car className="h-3 w-3 mr-1" />
              {getTranslatedTransportation(
                job.transportation,
                job.transportation_amount
              )}
            </Badge>
          )}
        </div>

        {/* 6. Amount of people applied - for non-owners, show at bottom */}
        {!isOwner && applicationCount !== null && (
          <div className="text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1 inline" />
            {applicationCount} {applicationCount === 1 ? t('person') : t('people')}{" "}
            {t('applied')}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog (only for owners) */}
      {isOwner && canEdit && (
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleEdit} 
            variant="outline" 
            size="sm"
            className="ml-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('editJob')}
          </Button>
        </CardFooter>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editJobPosting')}</DialogTitle>
            <DialogDescription>
              {t('updateJobDetails')}
            </DialogDescription>
          </DialogHeader>
          <MultiStepJobForm
            initialData={job}
            isEditMode={true}
            jobId={job.id}
            onJobPosted={handleJobUpdated}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
