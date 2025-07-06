'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Users, TrendingUp, BarChart, Building } from "lucide-react"
import Link from "next/link"

export function CompanyQuickActions() {
  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <BarChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Post New Job */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
          disabled
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-purple-900 dark:text-purple-100">Post New Job</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Create job listing</div>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
        </Button>

        {/* Manage Team */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
          disabled
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-purple-900 dark:text-purple-100">Manage Team</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Add team members</div>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
        </Button>

        {/* Company Settings */}
        <Link href="/settings" className="block">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-purple-900 dark:text-purple-100">Company Settings</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Update company profile</div>
            </div>
          </Button>
        </Link>

        {/* Promote Jobs */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
          disabled
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-purple-900 dark:text-purple-100">Promote Jobs</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Boost visibility</div>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
        </Button>

        {/* Enterprise Hub */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50"
          disabled
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40">
            <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <div className="font-medium text-purple-900 dark:text-purple-100">Enterprise Hub</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Advanced tools</div>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
        </Button>

        {/* Enterprise Tips Section */}
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Enterprise Tip
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Featured job postings receive 3x more qualified applications and faster hiring results.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
