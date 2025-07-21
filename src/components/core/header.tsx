"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';
import { useAuth } from "@/contexts/auth-context";
import { useDialogStore } from "@/stores/dialog-store";
import { OptimizedNotificationCenter } from "./optimized-notification-center";
import { OptimizedJobPostDialog } from "./optimized-job-post-dialog";
import { HeaderLoadingSkeleton, AuthenticatedHeaderSkeleton } from "./header-skeleton";
import { Button } from "@/components/ui/button";
import { AnimatedHamburger } from "@/components/ui/animated-hamburger";
import { useHamburgerAnimation } from "@/hooks/useHamburgerAnimation";
import {
  LogIn,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Zap,
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
  // Mobile menu animation state
  const [isClosing, setIsClosing] = useState(false);
  
  // Refs for GSAP animations
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const menuHamburgerRef = useRef<HTMLDivElement>(null);
  
  // Hamburger animation hook
  const { useHamburgerSync, cleanup } = useHamburgerAnimation();

  // Cleanup GSAP timelines on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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

  // Handle mobile menu close with animation
  const handleCloseMobileMenu = useCallback(() => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      closeMobileMenu();
      setIsClosing(false);
    }, 300); // Match animation duration
  }, [closeMobileMenu]);

  // Sync hamburger animations with menu state
  useHamburgerSync(isMobileMenuOpen, [hamburgerRef, menuHamburgerRef]);
  const canPostJob = useMemo(() => {
    return user && (user.role === "client" || user.role === "company" || user.role === "admin");
  }, [user]);

  // Memoized header classes
  const headerClasses = useMemo(() => `
    ${isScrolled ? 'fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] sm:w-[calc(100%-4rem)] max-w-[1400px] mx-auto rounded-lg px-6 py-3' : 'relative w-full'} 
    ${isScrolled ? 'bg-white/10 dark:bg-black/10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5 dark:supports-[backdrop-filter]:bg-black/5 shadow-2xl border border-white/20 dark:border-white/10' : 'bg-transparent border-b border-transparent'} 
    transition-[top,background-color,backdrop-filter,border-color,box-shadow] duration-500 ease-in-out
  `, [isScrolled]);

  const placeholderClasses = useMemo(() => `
    transition-[height] duration-500 ease-in-out ${isScrolled ? 'h-[100px]' : 'h-0'}
  `, [isScrolled]);
  return (
    <>
      {/* Placeholder to maintain layout when header becomes fixed */}
      <div className={placeholderClasses} />
      
      {/* Mobile Full-Screen Menu - Outside header to prevent positioning conflicts */}
      {isMobileMenuOpen && (
        <div className={`fixed inset-0 z-[70] bg-background md:hidden h-screen w-screen ${
          isClosing 
            ? 'animate-out fade-out-0 duration-300' 
            : 'animate-in fade-in-0 duration-300'
        }`}>
          <div className={`flex h-full w-full flex-col bg-background ${
            isClosing 
              ? 'animate-out slide-out-to-right-full duration-300 ease-in' 
              : 'animate-in slide-in-from-right-full duration-300 ease-out'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h2 className="text-lg font-semibold">{tAuth('menu')}</h2>
              {/* Animated hamburger/close icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleMobileMenu()}
                className="relative h-9 w-9 rounded-full hover:bg-accent/10 transition-colors"
              >
                <AnimatedHamburger ref={menuHamburgerRef} />
              </Button>
            </div>

            {/* Menu Items - Flex container for proper spacing */}
            <div className="flex-1 flex flex-col px-6 py-8 bg-background min-h-0">
              {user ? (
                <>
                  {/* Main Navigation */}
                  <nav className="space-y-6 border-b border-border pb-8 flex-shrink-0">
                    <Link
                      href="/dashboard"
                      className={getMobileMenuItemClass('/dashboard')}
                      onClick={handleCloseMobileMenu}
                    >
                      <LayoutDashboard className="mr-4 h-6 w-6" />
                      {tNavigation('dashboard')}
                    </Link>

                    <Link
                      href="/dashboard/jobs"
                      className={getMobileMenuItemClass('/dashboard/jobs')}
                      onClick={handleCloseMobileMenu}
                    >
                      <Briefcase className="mr-4 h-6 w-6" />
                      {tNavigation('jobs')}
                    </Link>

                    <Link
                      href="/dashboard/messages"
                      className={getMobileMenuItemClass('/dashboard/messages')}
                      onClick={handleCloseMobileMenu}
                    >
                      <MessageSquare className="mr-4 h-6 w-6" />
                      {tNavigation('messages')}
                    </Link>

                    <Link
                      href="/dashboard/connections"
                      className={getMobileMenuItemClass('/dashboard/connections')}
                      onClick={handleCloseMobileMenu}
                    >
                      <Zap className="mr-4 h-6 w-6" />
                      {tNavigation('connections')}
                    </Link>

                    <Link
                      href="/settings"
                      className={getMobileMenuItemClass('/settings')}
                      onClick={handleCloseMobileMenu}
                    >
                      <Settings className="mr-4 h-6 w-6" />
                      {tNavigation('settings')}
                    </Link>
                  </nav>
                  
                  {/* Logout at bottom */}
                  <div className="mt-auto pt-8">
                    <button
                      onClick={() => {
                        handleCloseMobileMenu();
                        handleSignOut();
                      }}
                      className="flex items-center py-4 text-lg font-medium text-destructive hover:text-destructive/80 transition-colors w-full text-left"
                    >
                      <LogOut className="mr-4 h-6 w-6" />
                      {tAuth('signOut')}
                    </button>
                  </div>
                </>
              ) : (
                /* Non-authenticated users - Auth buttons */
                <div className="flex flex-col space-y-6 justify-center flex-1">
                  <Link href="/auth/signin" onClick={handleCloseMobileMenu}>
                    <Button
                      variant="outline"
                      className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background font-bold transition-all duration-200 text-lg py-6"
                    >
                      <LogIn className="h-5 w-5 mr-3" />
                      {tHeader('auth.signIn')}
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={handleCloseMobileMenu}>
                    <Button
                      className="w-full bg-foreground hover:bg-foreground/80 text-background font-bold transition-all duration-200 text-lg py-6"
                    >
                      <UserPlus className="h-5 w-5 mr-3" />
                      {tHeader('auth.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <header className={headerClasses}>
      <div className={`${isScrolled ? 'w-full' : 'container mx-auto px-4 py-4'}`}>
        <div className={`flex items-center justify-between ${isScrolled ? 'py-0' : ''}`}>
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div>
              <h1 className={`${isScrolled ? 'text-lg' : 'text-2xl'} font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent transition-[font-size] duration-500`}>
                mojPoslić
              </h1>
            </div>
          </Link>
          <div className={`flex items-center ${isScrolled ? 'space-x-2' : 'space-x-4'}`}>
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
                    {/* Desktop: Full buttons with text and icons */}
                    <div className="hidden sm:flex items-center gap-2">
                      <Link href="/auth/signin">
                        <Button
                          variant="outline"
                          className="border-foreground text-foreground hover:bg-foreground hover:text-background font-bold transition-all duration-200 text-sm"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          {tHeader('auth.signIn')}
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button
                          className="bg-foreground hover:bg-foreground/80 text-background font-bold border-0 transition-all duration-200 text-sm"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {tHeader('auth.register')}
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Mobile: Both buttons with icons and text */}
                    <div className="flex sm:hidden items-center gap-2">
                      {/* Login - Icon + Text */}
                      <Link href="/auth/signin">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-foreground text-foreground hover:bg-foreground hover:text-background font-bold transition-all duration-200 h-9 px-2 text-sm"
                        >
                          <LogIn className="h-4 w-4 mr-1.5" />
                          {tHeader('auth.signIn')}
                        </Button>
                      </Link>
                      {/* Register - Icon + Text */}
                      <Link href="/auth/register">
                        <Button
                          size="sm"
                          className="bg-foreground hover:bg-foreground/80 text-background font-bold transition-all duration-200 h-9 px-2 text-sm"
                        >
                          <UserPlus className="h-4 w-4 mr-1.5" />
                          {tHeader('auth.register')}
                        </Button>
                      </Link>
                    </div>
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
                              href="/dashboard/connections"
                              className={getMenuItemClass('/dashboard/connections')}
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
                        className="relative h-9 w-9 rounded-full hover:bg-accent/10 transition-colors"
                      >
                        {/* Animated Hamburger Icon - only show when menu is closed */}
                        {!isMobileMenuOpen && (
                          <AnimatedHamburger ref={hamburgerRef} />
                        )}
                      </Button>
                    </div>
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
