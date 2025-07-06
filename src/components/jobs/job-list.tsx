"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./job-card";
import { JobCardSkeleton } from "./job-card-skeleton";
import { Job } from "@/types/job";
import { JobFilters } from "./job-list/job-filters";
import { JobsViewControls } from "./job-list/jobs-view-controls";
import { JobsEmptyState } from "./job-list/jobs-empty-state";
import { JobsPagination } from "./job-list/jobs-pagination";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface JobListProps {
  refreshTrigger?: number;
}

const JOBS_PER_PAGE = 20;

export function JobList({ refreshTrigger }: JobListProps) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs();
  }, [refreshTrigger]);

  // Fetch saved jobs when user changes
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) {
        setSavedJobIds(new Set());
        return;
      }

      try {
        const response = await fetch(`/api/user/saved-jobs?userId=${user.id}`);
        if (response.ok) {
          const savedData = await response.json();
          const jobs = savedData.savedJobs || [];
          setSavedJobIds(new Set(jobs.map((job: Job) => job.id)));
        }
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      }
    };

    fetchSavedJobs();
  }, [user]);

  // Handle job save/unsave
  const handleJobSaveToggle = async (jobId: string, isSaved: boolean) => {
    if (!user) {
      toast.error('Please sign in to save jobs');
      return;
    }

    if (isSaved) {
      // Add to saved jobs
      setSavedJobIds(prev => new Set([...prev, jobId]));
    } else {
      // Remove from saved jobs
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = cityFilter === "all" || job.city?.key === cityFilter;

    // Handle both main category and subcategory filtering
    let matchesCategory = true;
    if (categoryFilter !== "all") {
      if (subcategoryFilter !== "all") {
        // If subcategory is selected, match against subcategory
        matchesCategory = job.category?.key === subcategoryFilter;
      } else {
        // If only main category is selected, match against main category or any of its children
        matchesCategory = job.category?.key === categoryFilter || 
                         job.category?.parent_id === categoryFilter ||
                         job.category?.parentId === categoryFilter;
      }
    }

    const matchesType = typeFilter === "all" || job.type === typeFilter;

    return matchesSearch && matchesCity && matchesCategory && matchesType;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, cityFilter, categoryFilter, subcategoryFilter, typeFilter]);

  const hasActiveFilters =
    searchTerm !== "" ||
    cityFilter !== "all" ||
    categoryFilter !== "all" ||
    subcategoryFilter !== "all" ||
    typeFilter !== "all";

  const clearAllFilters = () => {
    setSearchTerm("");
    setCityFilter("all");
    setCategoryFilter("all");
    setSubcategoryFilter("all");
    setTypeFilter("all");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Filters skeleton */}
        <div className="space-y-6">
          <JobFilters
            searchTerm=""
            setSearchTerm={() => {}}
            cityFilter="all"
            setCityFilter={() => {}}
            categoryFilter="all"
            setCategoryFilter={() => {}}
            typeFilter="all"
            setTypeFilter={() => {}}
            subcategoryFilter="all"
            setSubcategoryFilter={() => {}}
          />

          <JobsViewControls
            filteredJobsCount={0}
            startIndex={0}
            endIndex={0}
            jobsPerPage={JOBS_PER_PAGE}
            hasActiveFilters={false}
            onClearFilters={() => {}}
          />
        </div>

        {/* Job skeletons */}
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-6">
        <JobFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          subcategoryFilter={subcategoryFilter}
          setSubcategoryFilter={setSubcategoryFilter}
        />

        <JobsViewControls
          filteredJobsCount={filteredJobs.length}
          startIndex={startIndex}
          endIndex={endIndex}
          jobsPerPage={JOBS_PER_PAGE}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      </div>

      {/* Job Display */}
      {filteredJobs.length === 0 ? (
        <JobsEmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {paginatedJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onJobUpdated={fetchJobs}
                isSaved={savedJobIds.has(job.id)}
                onSaveToggle={handleJobSaveToggle}
              />
            ))}
          </div>

          <JobsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
