'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { JobPostForm } from "@/components/job-post-form"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/prisma-auth-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Briefcase, Plus, LogIn } from "lucide-react"

export function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user, loading, isEmployer, isAdmin } = useAuth()
  const router = useRouter()

  const handleJobPosted = () => {
    setIsDialogOpen(false)
    // Refresh the page to update job listings
    router.refresh()
  }

  const handlePostJobClick = () => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!isEmployer && !isAdmin) {
      router.push('/login?message=Only employers can post jobs')
      return
    }
    
    setIsDialogOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Poslić.ba
              </h1>
              <p className="text-xs text-muted-foreground">Quick • Simple • Free jobs</p>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : user ? (
              <>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handlePostJobClick}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Post a Job - Free & Easy</DialogTitle>
                    </DialogHeader>
                    <JobPostForm onJobPosted={handleJobPosted} />
                  </DialogContent>
                </Dialog>
                <UserMenu />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePostJobClick}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Button>
                <Button 
                  onClick={() => router.push('/login')}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
