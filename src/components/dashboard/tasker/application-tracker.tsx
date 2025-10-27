"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useApplications,
  useUpdateApplication,
} from "@/hooks/use-applications";
import { ApplicationStatus, JobApplication } from "@/types/application";
import {
  Briefcase,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export function TaskerApplicationTracker() {
  const t = useTranslations("dashboard.applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: applications = [], isLoading } = useApplications({
    search: searchQuery || undefined,
  });

  // For now, calculate basic stats from the applications
  const stats = useMemo(() => {
    // Exclude withdrawn and rejected applications from stats
    const visibleApplications = applications.filter(
      (app) => app.status !== ApplicationStatus.WITHDRAWN && app.status !== ApplicationStatus.REJECTED
    );
    return {
      total: visibleApplications.length,
      pending: visibleApplications.filter(
        (app) => app.status === ApplicationStatus.PENDING
      ).length,
      selected: visibleApplications.filter(
        (app) => app.status === ApplicationStatus.SELECTED
      ).length,
    };
  }, [applications]);

  const updateApplicationMutation = useUpdateApplication();

  // Filter applications by status
  const filteredApplications = useMemo(() => {
    // Exclude withdrawn and rejected applications from display
    const filtered = applications.filter((app) => {
      // Never show withdrawn or rejected applications
      if (app.status === ApplicationStatus.WITHDRAWN || app.status === ApplicationStatus.REJECTED) return false;

      if (activeTab === "pending")
        return app.status === ApplicationStatus.PENDING;
      if (activeTab === "selected")
        return app.status === ApplicationStatus.SELECTED;
      return true;
    });

    // Apply search filter
    return filtered.filter(
      (app) =>
        app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job?.posted_by?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [applications, activeTab, searchQuery]);

  const handleWithdraw = async (applicationId: string) => {
    if (confirm(t("confirmWithdraw"))) {
      try {
        await updateApplicationMutation.mutateAsync({
          applicationId,
          updates: {
            status: ApplicationStatus.WITHDRAWN,
          },
        });
      } catch (error) {
        console.error("Withdraw error:", error);
      }
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      [ApplicationStatus.PENDING]: "bg-yellow-100 text-yellow-800",
      [ApplicationStatus.REVIEWED]: "bg-blue-100 text-blue-800",
      [ApplicationStatus.SHORTLISTED]: "bg-purple-100 text-purple-800",
      [ApplicationStatus.SELECTED]: "bg-green-100 text-green-800",
      [ApplicationStatus.REJECTED]: "bg-red-100 text-red-800",
      [ApplicationStatus.WITHDRAWN]: "bg-gray-100 text-gray-800",
      [ApplicationStatus.INTERVIEW_SCHEDULED]: "bg-purple-100 text-purple-800",
    };

    const icons: Record<ApplicationStatus, React.ElementType> = {
      [ApplicationStatus.PENDING]: Clock,
      [ApplicationStatus.REVIEWED]: Clock,
      [ApplicationStatus.SHORTLISTED]: Clock,
      [ApplicationStatus.SELECTED]: CheckCircle,
      [ApplicationStatus.REJECTED]: XCircle,
      [ApplicationStatus.WITHDRAWN]: X,
      [ApplicationStatus.INTERVIEW_SCHEDULED]: Clock,
    };

    const statusText: Record<ApplicationStatus, string> = {
      [ApplicationStatus.PENDING]: "Pending",
      [ApplicationStatus.REVIEWED]: "Reviewed",
      [ApplicationStatus.SHORTLISTED]: "Shortlisted",
      [ApplicationStatus.SELECTED]: "Selected",
      [ApplicationStatus.REJECTED]: "Cancelled by Client",
      [ApplicationStatus.WITHDRAWN]: "Withdrawn",
      [ApplicationStatus.INTERVIEW_SCHEDULED]: "Interview Scheduled",
    };

    const Icon = icons[status];

    // Only show simplified statuses for taskers
    if (
      status === ApplicationStatus.REVIEWED ||
      status === ApplicationStatus.SHORTLISTED
    ) {
      return getStatusBadge(ApplicationStatus.PENDING);
    }

    return (
      <Badge
        className={`${colors[status]} border-0 rounded-full px-2 py-1 text-xs font-medium`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {statusText[status]}
      </Badge>
    );
  };

  const getStatusTimeline = (application: any) => {
    const timeline = [];

    if (application.applied_at) {
      timeline.push({
        status: "Applied",
        date: application.applied_at,
        icon: Briefcase,
        color: "text-blue-600",
      });
    }

    if (application.selected_at) {
      timeline.push({
        status: "Selected",
        date: application.selected_at,
        icon: CheckCircle,
        color: "text-green-600",
      });
    }

    if (application.rejectedAt) {
      timeline.push({
        status: "Rejected",
        date: application.rejectedAt,
        icon: XCircle,
        color: "text-red-600",
      });
    }

    if (application.withdrawnAt) {
      timeline.push({
        status: "Withdrawn",
        date: application.withdrawnAt,
        icon: X,
        color: "text-gray-600",
      });
    }

    return timeline;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total || 0}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending || 0}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.selected || 0}
            </div>
                        <div className="text-sm text-gray-600">Selected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {(stats as any).rejected || 0}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            My Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="selected">Selected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchQuery
                      ? "No applications match your search"
                      : activeTab === "all"
                        ? "No applications yet"
                        : `No ${activeTab} applications`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card
                      key={application.id}
                      className="border border-gray-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                  {application.job?.title}
                                </h3>
                                {application.job?.posted_by?.name && (
                                  <p className="text-gray-600 font-medium">
                                    {application.job.posted_by.name}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  {application.job?.job_type && (
                                    <div className="flex items-center gap-1">
                                      <Briefcase className="h-4 w-4" />
                                      {application.job.job_type}
                                    </div>
                                  )}
                                  {application.job?.salary_min && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-4 w-4" />
                                      {`${application.job.salary_min}${application.job.salary_max ? `-${application.job.salary_max}` : ""} BAM`}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                {getStatusBadge(application.status as any)}
                                <p className="text-xs text-gray-500 mt-1">
                                  Applied{" "}
                                  {formatDistanceToNow(
                                    new Date(application.applied_at)
                                  )}{" "}
                                  ago
                                </p>
                              </div>
                            </div>

                            {/* Application Timeline */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Application Timeline
                              </p>
                              <div className="flex items-center gap-4 overflow-x-auto">
                                {getStatusTimeline(application).map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 whitespace-nowrap"
                                    >
                                      <item.icon
                                        className={`h-4 w-4 ${item.color}`}
                                      />
                                      <div className="text-xs">
                                        <div className="font-medium">
                                          {item.status}
                                        </div>
                                        <div className="text-gray-500">
                                          {format(
                                            new Date(item.date),
                                            "MMM d, yyyy"
                                          )}
                                        </div>
                                      </div>
                                      {index <
                                        getStatusTimeline(application).length -
                                          1 && (
                                        <div className="w-4 h-px bg-gray-300 mx-2" />
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Feedback */}
                            {(application as any).feedback && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-1">
                                  Feedback
                                </h4>
                                <p className="text-sm text-gray-700">
                                  {(application as any).feedback}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4">
                              <Button size="sm" variant="outline">
                                <Briefcase className="h-4 w-4 mr-1" />
                                View Job
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message Employer
                              </Button>
                              {application.status ===
                                ApplicationStatus.PENDING && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleWithdraw(application.id)}
                                  disabled={updateApplicationMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Withdraw
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
