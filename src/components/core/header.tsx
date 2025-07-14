"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';
import { MultiStepJobForm } from "@/components/jobs/job-post-form/multi-step-job-form";
import { useAuth } from "@/contexts/auth-context";
import { useDialogStore } from "@/stores/dialog-store";
import { ThemeToggleButton } from "@/components/core/theme-toggle-button";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { NotificationCenter } from "@/components/ui/notification-center";
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
  const pathname = usePathname();
  
  // Scroll detection state
  const [isScrolled, setIsScrolled] = useState(false);

  // Translation hooks
  const tAuth = useTranslations('auth');
  const tHeader = useTranslations('header');
  const tNavigation = useTranslations('navigation.main');

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100); // Fixed after scrolling 100px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <>
      {/* Placeholder to maintain layout when header becomes fixed */}
      <div className={`transition-all duration-500 ease-in-out ${isScrolled ? 'h-[73px]' : 'h-0'}`} />
      
      <header className={`
        ${isScrolled ? 'fixed top-0 left-0 right-0 z-50' : 'relative'} 
        ${isScrolled ? 'bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-lg border-b border-border/40' : 'bg-transparent border-b border-transparent'} 
        transition-all duration-500 ease-in-out
      `}>
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
                    <Dialog open={isJobPostDialogOpen} onOpenChange={(open) => {
                      if (!open) {
                        closeJobPostDialog();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-foreground hover:bg-foreground/80 text-background font-bold border-0 transition-all duration-200"
                          onClick={handlePostJobClick}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {tHeader('postJob')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto xl:max-w-6xl 2xl:max-w-7xl">
                        <DialogHeader>
                          <DialogTitle>{tHeader('postJobDialog')}</DialogTitle>
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
                    <LanguageSwitcher />
                    <Link href="/auth/signin">
                      <Button
                        variant="outline"
                        className="border-foreground text-foreground hover:bg-foreground hover:text-background font-bold transition-all duration-200"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {tAuth('signIn')}
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        className="bg-foreground hover:bg-foreground/80 text-background font-bold border-0 transition-all duration-200"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {tAuth('register')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Notifications */}
                    <NotificationCenter />

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
                              {tNavigation('dashboard')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard/jobs"
                              className={getMenuItemClass('/dashboard/jobs')}
                            >
                              <Briefcase className="mr-2 h-6 w-6" />
                              {tNavigation('jobs')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard/messages"
                              className={getMenuItemClass('/dashboard/messages')}
                            >
                              <MessageSquare className="mr-2 h-6 w-6" />
                              {tNavigation('messages')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/connections"
                              className={getMenuItemClass('/connections')}
                            >
                              <Zap className="mr-2 h-6 w-6" />
                              {tNavigation('connections')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/settings" className={getMenuItemClass('/settings')}>
                              <Settings className="mr-2 h-6 w-6" />
                              {tNavigation('settings')}
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
                          <DropdownMenuItem asChild>
                            <div className="cursor-pointer w-full p-2">
                              <LanguageSwitcher />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-6 w-6" />
                            {tAuth('signOut')}
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
                            <h2 className="text-lg font-semibold">{tAuth('menu')}</h2>
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
                                {tNavigation('dashboard')}
                              </Link>

                              <Link
                                href="/dashboard/jobs"
                                className={getMobileMenuItemClass('/dashboard/jobs')}
                                onClick={() => closeMobileMenu()}
                              >
                                <Briefcase className="mr-4 h-6 w-6" />
                                {tNavigation('jobs')}
                              </Link>

                              <Link
                                href="/dashboard/messages"
                                className={getMobileMenuItemClass('/dashboard/messages')}
                                onClick={() => closeMobileMenu()}
                              >
                                <MessageSquare className="mr-4 h-6 w-6" />
                                {tNavigation('messages')}
                              </Link>

                              <Link
                                href="/connections"
                                className={getMobileMenuItemClass('/connections')}
                                onClick={() => closeMobileMenu()}
                              >
                                <Zap className="mr-4 h-6 w-6" />
                                {tNavigation('connections')}
                              </Link>

                              <div className="border-t pt-6">
                                <Link
                                  href="/settings"
                                  className={getMobileMenuItemClass('/settings')}
                                  onClick={() => closeMobileMenu()}
                                >
                                  <Settings className="mr-4 h-6 w-6" />
                                  {tNavigation('settings')}
                                </Link>

                                <div className="py-4">
                                  <ThemeToggleButton 
                                    className="text-lg font-medium hover:text-primary"
                                    iconClassName="h-6 w-6"
                                    onToggle={() => {}}
                                  />
                                </div>

                                <div className="py-4">
                                  <LanguageSwitcher />
                                </div>

                                <button
                                  onClick={() => {
                                    closeMobileMenu();
                                    handleSignOut();
                                  }}
                                  className="flex items-center py-4 text-lg font-medium text-destructive hover:text-destructive/80 transition-colors w-full text-left"
                                >
                                  <LogOut className="mr-4 h-6 w-6" />
                                  {tAuth('signOut')}
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
    </>
  );
}
