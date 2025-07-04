'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { MultiStepJobForm } from "@/components/job-post-form/multi-step-job-form"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, LogIn, LogOut, User, Settings, LayoutDashboard } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: session } = useSession()
  const { loading } = useAuth()
  const router = useRouter()

  const handleJobPosted = () => {
    setIsDialogOpen(false)
    // Refresh the page to update job listings
    router.refresh()
  }

  const handlePostJobClick = () => {
    // Open the dialog - Auth.js will handle authentication
    setIsDialogOpen(true)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                mojPoslić
              </h1>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            {/* Show loading skeleton briefly */}
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Post Job Button - only visible when signed in */}
                {session && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handlePostJobClick}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Post Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto xl:max-w-6xl 2xl:max-w-7xl">
                      <DialogHeader>
                        <DialogTitle>Post a Job - Free & Easy</DialogTitle>
                      </DialogHeader>
                      <MultiStepJobForm onJobPosted={handleJobPosted} showCard={false} />
                    </DialogContent>
                  </Dialog>
                )}

                {/* Auth.js Authentication Components */}
                {!session ? (
                  <Button 
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                    onClick={() => signIn()}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
