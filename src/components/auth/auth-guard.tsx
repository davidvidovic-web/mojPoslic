/**
 * Client-side authentication guard that handles role and profile completion checks
 * This component replaces the complex middleware logic with page-level guards
 */
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DatabaseRole } from '@/lib/role-utils';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: boolean;
  requireProfileComplete?: boolean;
  allowedRoles?: DatabaseRole[];
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireRole = false, 
  requireProfileComplete = false,
  allowedRoles,
  redirectTo 
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    // Not authenticated
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check role requirement
    if (requireRole && !session.user?.role) {
      router.push('/role-selection');
      return;
    }

    // Check profile completion requirement
    if (requireProfileComplete && !session.user?.profileSetupCompleted) {
      router.push('/profile-setup');
      return;
    }

    // Check allowed roles
    if (allowedRoles && session.user?.role && !allowedRoles.includes(session.user.role as DatabaseRole)) {
      router.push(redirectTo || '/dashboard');
      return;
    }

    setIsChecking(false);
  }, [session, status, router, requireRole, requireProfileComplete, allowedRoles, redirectTo]);

  // Show loading state while checking
  if (status === 'loading' || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protected pages
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...guardProps}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Specific guards for common use cases
 */

// Dashboard guard - requires authentication, role, and completed profile
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireRole={true} requireProfileComplete={true}>
      {children}
    </AuthGuard>
  );
}

// Role selection guard - prevents access if user already has a role
export function RoleSelectionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // If user already has a role, redirect them
    if (session.user?.role) {
      if (session.user.profileSetupCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/profile-setup');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show content if user doesn't have a role
  if (session?.user?.role) {
    return null;
  }

  return <>{children}</>;
}

// Profile setup guard - prevents access if profile already completed
export function ProfileSetupGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Require role first
    if (!session.user?.role) {
      router.push('/role-selection');
      return;
    }

    // If profile already completed, redirect to dashboard
    if (session.user.profileSetupCompleted) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show content if user has role but profile not completed
  if (!session?.user?.role || session.user.profileSetupCompleted) {
    return null;
  }

  return <>{children}</>;
}
