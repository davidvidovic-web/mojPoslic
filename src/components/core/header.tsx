"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MultiStepJobForm } from "@/components/jobs/job-post-form/multi-step-job-form";
import { useAuth } from "@/contexts/auth-context";
import { useCreateJob } from "@/hooks/use-jobs";
import { useDialogStore } from "@/stores/dialog-store";
import { ThemeToggleButton } from "@/components/core/theme-toggle-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  LogIn,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Zap,
  Menu,
  X,
  Puzzle,
  Bell,
  BarChart3,
  CreditCard,
  Lock,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { 
    isJobPostDialogOpen, 
    openJobPostDialog, 
    closeJobPostDialog, 
    isMobileMenuOpen, 
    toggleMobileMenu,
    closeMobileMenu
  } = useDialogStore();
  const { loading, user, signOut } = useAuth();
  const createJobMutation = useCreateJob();
  const pathname = usePathname();

  // Helper function to check if a menu item is active
  const isActiveMenuItem = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const getMenuItemClass = (href: string) => {
    const baseClass = "cursor-pointer";
    const activeClass = "bg-primary text-primary-foreground";
    return isActiveMenuItem(href) ? `${baseClass} ${activeClass}` : baseClass;
  };

  const getMobileMenuItemClass = (href: string) => {
    const baseClass = "flex items-center py-4 text-lg font-medium transition-colors";
    const activeClass = "bg-primary text-primary-foreground rounded-lg px-2 -mx-2";
    const inactiveClass = "hover:text-primary";
    return isActiveMenuItem(href) ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  };

  const handleJobPosted = () => {
    closeJobPostDialog();
    // TanStack Query automatically handles cache invalidation after job creation
    // No manual refresh needed!
  };

  const handlePostJobClick = () => {
    // Open the dialog - Auth.js will handle authentication
    openJobPostDialog();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
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
                <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Post Job Button - only visible when signed in and not a tasker */}
                {user &&
                  (user.role === "client" ||
                    user.role === "company" ||
                    user.role === "admin") && (
                    <Dialog open={isJobPostDialogOpen} onOpenChange={closeJobPostDialog}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-foreground hover:bg-foreground/80 text-background font-bold border-0 transition-all duration-200"
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
                        <MultiStepJobForm
                          onJobPosted={handleJobPosted}
                          showCard={false}
                        />
                      </DialogContent>
                    </Dialog>
                  )}

                {/* Auth.js Authentication Components */}
                {!user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/signin">
                      <Button
                        variant="outline"
                        className="border-foreground text-foreground hover:bg-foreground hover:text-background font-bold transition-all duration-200"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        className="bg-foreground hover:bg-foreground/80 text-background font-bold border-0 transition-all duration-200"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Notifications Bell */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-9 w-9 rounded-full"
                    >
                      <Bell className="h-7 w-7" />
                      {/* Notification dot - you can conditionally show this */}
                      {/* <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span> */}
                    </Button>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="relative h-9 w-9 rounded-full"
                          >
                            <User className="h-7 w-7" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-56"
                          align="end"
                          forceMount
                        >
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard"
                              className={getMenuItemClass('/dashboard')}
                            >
                              <LayoutDashboard className="mr-2 h-6 w-6" />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard/applications"
                              className={getMenuItemClass('/dashboard/applications')}
                            >
                              <Briefcase className="mr-2 h-6 w-6" />
                              Job Applications
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard/messages"
                              className={getMenuItemClass('/dashboard/messages')}
                            >
                              <MessageSquare className="mr-2 h-6 w-6" />
                              Messages
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard/connections"
                              className={getMenuItemClass('/dashboard/connections')}
                            >
                              <Zap className="mr-2 h-6 w-6" />
                              Connections
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <div className="flex items-center cursor-not-allowed opacity-50">
                              <BarChart3 className="mr-2 h-6 w-6" />
                              Statistics
                              <Lock className="ml-auto h-5 w-5" />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <div className="flex items-center cursor-not-allowed opacity-50">
                              <CreditCard className="mr-2 h-6 w-6" />
                              Finances
                              <Lock className="ml-auto h-5 w-5" />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <div className="flex items-center cursor-not-allowed opacity-50">
                              <Puzzle className="mr-2 h-6 w-6" />
                              Integrations
                              <Lock className="ml-auto h-5 w-5" />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/settings" className={getMenuItemClass('/settings')}>
                              <Settings className="mr-2 h-6 w-6" />
                              Settings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <div className="cursor-pointer w-full">
                              <ThemeToggleButton 
                                className="py-0 hover:text-inherit"
                                iconClassName="h-6 w-6"
                              />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-6 w-6" />
                            Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMobileMenu()}
                        className="relative h-9 w-9 rounded-full"
                      >
                        <Menu className="h-7 w-7" />
                      </Button>
                    </div>

                    {/* Mobile Full-Screen Menu */}
                    {isMobileMenuOpen && (
                      <div className="fixed inset-0 z-[60] bg-background md:hidden">
                        <div className="flex h-full flex-col bg-background">
                          {/* Header */}
                          <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Menu</h2>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => closeMobileMenu()}
                              className="h-9 w-9 rounded-full"
                            >
                              <X className="h-7 w-7" />
                            </Button>
                          </div>

                          {/* Menu Items */}
                          <div className="flex-1 px-6 py-8 bg-background">
                            <nav className="space-y-6">
                              <Link
                                href="/dashboard"
                                className={getMobileMenuItemClass('/dashboard')}
                                onClick={() => closeMobileMenu()}
                              >
                                <LayoutDashboard className="mr-4 h-6 w-6" />
                                Dashboard
                              </Link>

                              <Link
                                href="/dashboard/applications"
                                className={getMobileMenuItemClass('/dashboard/applications')}
                                onClick={() => closeMobileMenu()}
                              >
                                <Briefcase className="mr-4 h-6 w-6" />
                                Job Applications
                              </Link>

                              <Link
                                href="/dashboard/messages"
                                className={getMobileMenuItemClass('/dashboard/messages')}
                                onClick={() => closeMobileMenu()}
                              >
                                <MessageSquare className="mr-4 h-6 w-6" />
                                Messages
                              </Link>

                              <Link
                                href="/dashboard/connections"
                                className={getMobileMenuItemClass('/dashboard/connections')}
                                onClick={() => closeMobileMenu()}
                              >
                                <Zap className="mr-4 h-6 w-6" />
                                Connections
                              </Link>

                              <div className="flex items-center py-4 text-lg font-medium opacity-50 cursor-not-allowed">
                                <BarChart3 className="mr-4 h-6 w-6" />
                                Statistics
                                <Lock className="ml-auto h-5 w-5" />
                              </div>

                              <div className="flex items-center py-4 text-lg font-medium opacity-50 cursor-not-allowed">
                                <CreditCard className="mr-4 h-6 w-6" />
                                Finances
                                <Lock className="ml-auto h-5 w-5" />
                              </div>

                              <div className="flex items-center py-4 text-lg font-medium opacity-50 cursor-not-allowed">
                                <Puzzle className="mr-4 h-6 w-6" />
                                Integrations
                                <Lock className="ml-auto h-5 w-5" />
                              </div>

                              <div className="border-t pt-6">
                                <Link
                                  href="/settings"
                                  className={getMobileMenuItemClass('/settings')}
                                  onClick={() => closeMobileMenu()}
                                >
                                  <Settings className="mr-4 h-6 w-6" />
                                  Settings
                                </Link>

                                <div className="py-4">
                                  <ThemeToggleButton 
                                    className="text-lg font-medium hover:text-primary"
                                    iconClassName="h-6 w-6"
                                    onToggle={() => {}}
                                  />
                                </div>

                                <button
                                  onClick={() => {
                                    closeMobileMenu();
                                    handleSignOut();
                                  }}
                                  className="flex items-center py-4 text-lg font-medium text-destructive hover:text-destructive/80 transition-colors w-full text-left"
                                >
                                  <LogOut className="mr-4 h-6 w-6" />
                                  Sign Out
                                </button>
                              </div>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
