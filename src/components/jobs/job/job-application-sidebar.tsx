'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Building2,
  ExternalLink, 
  Mail,
  MapPin
} from "lucide-react"
import { Job } from "@/types/job"

interface JobApplicationSidebarProps {
  job: Job
  user: { name?: string | null; email?: string | null } | null
  applying: boolean
  handleApply: () => void
  showAboutSection?: boolean // New prop to control About section visibility
}

export function JobApplicationSidebar({ job, user, applying, handleApply, showAboutSection = true }: JobApplicationSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Apply Card */}
      <Card>
        <CardHeader>
          <CardTitle>Apply for this position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleApply}
            className="w-full"
            disabled={applying || (!job.application_url && !job.contact_email)}
            size="lg"
          >
            {applying ? 'Opening...' : 'Apply Now'}
            {job.application_url && <ExternalLink className="h-4 w-4 ml-2" />}
            {!job.application_url && job.contact_email && <Mail className="h-4 w-4 ml-2" />}
          </Button>
          
          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              You need to log in to apply for this job
            </p>
          )}
        </CardContent>
      </Card>

      {/* Company Info */}
      {showAboutSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              About {job.company}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.city?.name || 'Remote'}</span>
            </div>
            
            {job.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${job.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {job.email}
                </a>
              </div>
            )}
            
            {job.contact_email && job.contact_email !== job.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${job.contact_email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {job.contact_email}
                </a>
              </div>
            )}
            
            {job.website && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={job.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Company Website
                </a>
              </div>
            )}
            
            {job.application_url && job.application_url !== job.website && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Application Portal
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
