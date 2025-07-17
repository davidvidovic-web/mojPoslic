"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';
import { useAuth } from "@/contexts/auth-context";
import { useDialogStore } from "@/stores/dialog-store";
import { OptimizedNotificationCenter } from "./optimized-notification-center";
import { OptimizedJobPostDialog } from "./optimized-job-post-dialog";
import { HeaderLoadingSkeleton, AuthenticatedHeaderSkeleton } from "./header-skeleton";
import { Button } from "@/components/ui/button";
import {
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

export const Header = React.memo(function Header() {
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

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    setIsScrolled(scrollTop > 100);
  }, []);

  // Scroll detection effect with throttling
  useEffect(() => {
    let ticking = false;
    
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  // Memoized helper functions
  const isActiveMenuItem = useCallback((href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  }, [pathname]);

  const getMenuItemClass = useCallback((href: string) => {
    const baseClass = "cursor-pointer";
    const activeClass = "bg-primary text-primary-foreground";
    return isActiveMenuItem(href) ? `${baseClass} ${activeClass}` : baseClass;
  }, [isActiveMenuItem]);

  const getMobileMenuItemClass = useCallback((href: string) => {
    const baseClass = "flex items-center py-4 text-lg font-medium transition-colors";
    const activeClass = "bg-primary text-primary-foreground rounded-lg px-2 -mx-2";
    const inactiveClass = "hover:text-primary";
    return isActiveMenuItem(href) ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  }, [isActiveMenuItem]);

  // Memoized handlers
  const handleJobPosted = useCallback(() => {
    closeJobPostDialog();
  }, [closeJobPostDialog]);

  const handlePostJobClick = useCallback(() => {
    openJobPostDialog();
  }, [openJobPostDialog]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  // Memoized user checks
  const canPostJob = useMemo(() => {
    return user && (user.role === "client" || user.role === "company" || user.role === "admin");
  }, [user]);

  // Memoized header classes
  const headerClasses = useMemo(() => `
    ${isScrolled ? 'fixed top-0 left-0 right-0 z-50' : 'relative'} 
    ${isScrolled ? 'bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-lg border-b border-border/40' : 'bg-transparent border-b border-transparent'} 
    transition-all duration-500 ease-in-out
  `, [isScrolled]);

  const placeholderClasses = useMemo(() => `
    transition-all duration-500 ease-in-out ${isScrolled ? 'h-[73px]' : 'h-0'}
  `, [isScrolled]);
  return (
    <>
      {/* Placeholder to maintain layout when header becomes fixed */}
      <div className={placeholderClasses} />
      
      <header className={headerClasses}>
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
            {/* Optimized loading state with skeleton components */}
            {loading ? (
              user ? <AuthenticatedHeaderSkeleton /> : <HeaderLoadingSkeleton />
            ) : (
              <div className="flex items-center space-x-2">
                {/* Post Job Button - only visible when signed in and not a tasker */}
                {canPostJob && (
                  <OptimizedJobPostDialog
                    isOpen={isJobPostDialogOpen}
                    onOpenChange={(open) => {
                      if (!open) {
                        closeJobPostDialog();
                      }
                    }}
                    onJobPosted={handleJobPosted}
                    triggerText={tHeader('postJob')}
                    dialogTitle={tHeader('postJobDialog')}
                    onTriggerClick={handlePostJobClick}
                  />
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
                    {/* Optimized Notifications */}
                    <OptimizedNotificationCenter />

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
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
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
                                </div>

                                <div className="py-4">
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
});
