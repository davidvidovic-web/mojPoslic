"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  DollarSign,
  Edit,
  Car,
  Star,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Job } from "@/types/job";
import {
  formatJobType,
  getJobTypeBadgeVariant,
  formatTransportation,
  formatTimeAgo,
  formatDuration,
} from "@/lib/job-utils";
import { useAuth } from "@/hooks/useAuth";
import { MultiStepJobForm } from "@/components/jobs/job-post-form/multi-step-job-form";

interface UnifiedJobCardProps {
  job: Job;
  onJobUpdated?: () => void;
}

export function UnifiedJobCard({ job, onJobUpdated }: UnifiedJobCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);

  // Check if the current user owns this job
  const isOwner = user && job.posted_by === user.id;

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
          ? "/hr"
          : job.salaryType === "daily"
            ? "/day"
            : job.salaryType === "weekly"
              ? "/week"
              : job.salaryType === "monthly"
                ? "/month"
                : "";
      return `${min}-${max} BAM${type}`;
    }

    // If we only have minimum salary
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString();
      const type =
        job.salaryType === "hourly"
          ? "/hr"
          : job.salaryType === "daily"
            ? "/day"
            : job.salaryType === "weekly"
              ? "/week"
              : job.salaryType === "monthly"
                ? "/month"
                : "";
      
      // Don't show "From" for fixed prices
      if (job.salaryType === 'fixed') {
        return `${min} BAM`;
      }
      
      return `From ${min} BAM${type}`;
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
    toast.success("Job updated successfully!");
  };

  return (
    <Card
      className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer border-border/40"
      onClick={handleViewDetails}
    >
      <CardContent className="p-4 space-y-3">
        {/* 1. Posted time - small font */}
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(job.posted_at)}
          </span>
          {/* 7. Amount of people applied - top right for owners */}
          {isOwner && applicationCount !== null && (
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {applicationCount} applied
            </Badge>
          )}
        </div>

        {/* 2. Title of the post - big font */}
        <h3 className="text-xl font-bold leading-tight line-clamp-2">
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

        {/* 5. Description - normal font with read more button */}
        <div>
          <div
            className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* 6. Bubble tags */}
        <div className="flex flex-wrap gap-2">
          {job.is_featured && (
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Featured
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

          {job.transportation && job.transportation !== "not_provided" && (
            <Badge variant="outline" className="text-xs">
              <Car className="h-3 w-3 mr-1" />
              {formatTransportation(job.transportation)}
            </Badge>
          )}
        </div>

        {/* 7. Verification and user reviews */}
        <div className="space-y-2">
          {/* Reviews only (verification hidden for now) */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{mockUserData.rating} ({mockUserData.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* 7. Amount of people applied - for non-owners */}
        {!isOwner && applicationCount !== null && (
          <div className="text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1 inline" />
            {applicationCount} {applicationCount === 1 ? "person" : "people"}{" "}
            applied
          </div>
        )}

        {/* Action Buttons */}
        {isOwner && canEdit && (
          <div className="flex items-center justify-end pt-2 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
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
