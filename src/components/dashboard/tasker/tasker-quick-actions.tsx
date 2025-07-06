'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Star, BookOpen, User, BarChart } from "lucide-react"
import Link from "next/link"

export function TaskerQuickActions() {
  return (
    <Card className="border-emerald-200 dark:border-emerald-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <BarChart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Find Jobs */}
        <Link href="/" className="block">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-emerald-900 dark:text-emerald-100">Find Jobs</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Browse available opportunities</div>
            </div>
          </Button>
        </Link>

        {/* Update Profile */}
        <Link href="/settings" className="block">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-emerald-900 dark:text-emerald-100">Update Profile</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Enhance your visibility</div>
            </div>
          </Button>
        </Link>

        {/* View Skills */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
          disabled
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-emerald-900 dark:text-emerald-100">Manage Skills</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">Add certifications</div>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
        </Button>

        {/* Learning Center */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
          disabled
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-emerald-900 dark:text-emerald-100">Learning Center</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">Skill development</div>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
        </Button>

        {/* Tips Section */}
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            Pro Tip
          </h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Complete your profile to increase your chances of getting hired and unlock Quick Apply features for faster job applications.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
