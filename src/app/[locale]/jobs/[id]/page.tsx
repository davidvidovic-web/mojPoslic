"use client";

import { useParams } from "next/navigation";
import { JobDetails } from "@/components/jobs/job-details";

export default function JobDetailPage() {
  const params = useParams();
  const slugOrId = params.id as string;
  
  // Extract job ID from slug (format: "job-title-slug-{jobId}")
  const jobId = slugOrId.includes('-') ? slugOrId.split('-').pop() || slugOrId : slugOrId;

  return <JobDetails jobId={jobId} />;
}
