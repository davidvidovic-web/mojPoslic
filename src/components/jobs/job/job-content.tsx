'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Briefcase,
  Clock,
  Users
} from "lucide-react"
import { Job } from "@/types/job"

interface JobContentProps {
  job: Job
}

export function JobContent({ job }: JobContentProps) {
  return (
    <div className="space-y-6">
      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </CardContent>
      </Card>

      {/* Requirements */}
      {job.requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: job.requirements }}
            />
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: job.benefits }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills & Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
