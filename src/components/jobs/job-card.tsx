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
  formatJobType,
  getJobTypeBadgeVariant,
  formatTransportation,
  formatTimeAgo,
  formatDuration,
} from "@/lib/job-utils";
import { useAuth } from "@/contexts/auth-context";
import { MultiStepJobForm } from "@/components/jobs/job-post-form/multi-step-job-form";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isJobSaved, setIsJobSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);

  // Check if the current user owns this job
  const isOwner = user && job.posted_by === user.id;

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
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Mock data for reviews (in real app, this would come from API)
  const mockUserData = {
    rating: (Math.random() * 2 + 3).toFixed(1), // Rating between 3.0 and 5.0
    reviewCount: Math.floor(Math.random() * 50) + 1, // 1 to 50 reviews
  };

  // Mock application count for demo (memoized to prevent dependency issues)
  const getMockApplicationCount = useCallback(() => {
    return Math.floor(Math.random() * 15); // 0 to 14 applications
  }, []);

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
    } else {
      // For non-owners, set mock application count for demo
      setApplicationCount(getMockApplicationCount());
    }
  }, [isOwner, checkApplicationCount, getMockApplicationCount]);

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
            {formatTimeAgo(job.posted_at)}
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
            <span>{job.city?.name || "Remote"}</span>
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
              {formatDuration(job.duration)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0 space-y-3">
        {/* 5. Description - normal font with read more button */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncatedDescription}
          </p>
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
            {formatJobType(job.type)}
          </Badge>

          {job.category && (
            <Badge variant="secondary" className="text-xs">
              {job.category.name}
            </Badge>
          )}

          {job.transportation && (
            <Badge variant="outline" className="text-xs">
              <Car className="h-3 w-3 mr-1" />
              {formatTransportation(
                job.transportation,
                job.transportation_amount
              )}
            </Badge>
          )}
        </div>

        {/* 6. Verification and user reviews */}
        <div className="space-y-2">
          {/* Reviews only (verification hidden for now) */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{mockUserData.rating} ({mockUserData.reviewCount} {t('reviews')})</span>
            </div>
          </div>
        </div>

        {/* 7. Amount of people applied - for non-owners, show at bottom */}
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
