"use client";

import { JobList } from "@/components/jobs/job-list";
import SiteStats from "@/components/common/site-stats";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Zap, UserPlus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // Use an interval to refresh jobs periodically (alternative to direct callback)
  // This ensures new jobs posted from the header will appear

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="text-sm font-medium px-3 py-1 flex items-center gap-1 w-fit mx-auto"
              >
                <Zap className="h-4 w-4" />
                Quick • Simple • Free
              </Badge>

              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Post & Find
                <span className="block bg-gradient-brand bg-clip-text text-transparent">
                  Quick Jobs
                </span>
              </h2>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The fastest way to post quick jobs and find reliable workers in
                Bosnia. Simple, free, and trusted by thousands.
              </p>

              {/* Call to Action Button */}
              <div className="flex justify-center items-center mt-8">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold border-0 px-8 py-3 text-lg transition-all duration-200"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Register for free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Light Separator */}
      <div className="flex justify-center py-8">
        <div className="w-1/2 h-px bg-border"></div>
      </div>

      {/* Browse Jobs Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2 mb-12">
            <h3 className="text-3xl font-bold">Browse Available Jobs</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover opportunities that match your skills and preferences
            </p>
          </div>
          <JobList />
        </div>
      </section>

      {/* Site Stats Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">Site Statistics</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how mojPoslić is connecting workers and clients across
                Bosnia and Herzegovina
              </p>
            </div>
            <SiteStats />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border">
                  <Briefcase className="h-4 w-4" />
                </div>
                <span className="font-bold">mojPoslić</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Quick, simple & free job posting platform for Bosnia and
                Herzegovina.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">For Workers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Find Quick Jobs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Daily Work
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Hourly Jobs
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">For Clients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Post Quick Jobs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Find Workers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    100% Free
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-sm text-default-600">
            <p>
              &copy; 2025 mojPoslić. Built with Next.js, shadcn/ui, and Prisma.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
