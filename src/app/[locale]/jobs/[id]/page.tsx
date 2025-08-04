"use client";

import { useParams } from "next/navigation";
import { JobDetails } from "@/components/jobs/job-details";

export default function JobDetailPage() {
  const params = useParams();

  return <JobDetails jobId={params.id as string} />;
}
