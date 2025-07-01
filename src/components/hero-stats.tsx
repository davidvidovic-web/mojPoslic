"use client";

import { useState, useEffect } from "react";
import { Briefcase, Users, CheckCircle, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  activeJobs: number;
  clients: number;
  totalUsers: number;
  finishedJobs: number;
}

const HeroStatsComponent = () => {
  const [stats, setStats] = useState<StatsData>({
    activeJobs: 0,
    employers: 0,
    totalUsers: 0,
    finishedJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const AnimatedNumber = ({
    value,
    suffix = "",
  }: {
    value: number;
    suffix?: string;
  }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (loading) return;

      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [value]);

    if (loading) {
      return <Skeleton className="w-16 h-8" />;
    }

    return (
      <span>
        {suffix === "%"
          ? `${displayValue}${suffix}`
          : `${formatNumber(displayValue)}${suffix}`}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900">
          <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-2xl font-bold flex items-center justify-center">
          <AnimatedNumber value={stats.activeJobs} suffix="+" />
        </div>
        <div className="text-sm text-muted-foreground">Active Jobs</div>
      </div>

      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900">
          <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-2xl font-bold flex items-center justify-center">
          <AnimatedNumber value={stats.employers} suffix="+" />
        </div>
        <div className="text-sm text-muted-foreground">
          Registered Clients
        </div>
      </div>

      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-orange-100 dark:bg-orange-900">
          <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="text-2xl font-bold flex items-center justify-center">
          <AnimatedNumber value={stats.totalUsers} suffix="+" />
        </div>
        <div className="text-sm text-muted-foreground">Registered Users</div>
      </div>

      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-2xl font-bold flex items-center justify-center">
          <AnimatedNumber value={stats.finishedJobs} suffix="+" />
        </div>
        <div className="text-sm text-muted-foreground">Finished Jobs</div>
      </div>
    </div>
  );
};

export default HeroStatsComponent;
