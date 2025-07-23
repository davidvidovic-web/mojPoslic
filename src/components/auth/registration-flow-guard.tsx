/**
 * Registration Flow Guard - Handles the complete onboarding flow
 * Uses database as single source of truth to eliminate JWT/DB sync issues
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface RegistrationStatus {
  needsRole: boolean;
  needsProfile: boolean;
  isComplete: boolean;
  userState: {
    role: string | null;
    profileSetupCompleted: boolean;
    emailVerified: boolean;
  };
}

type FlowState = 'checking' | 'complete' | 'needs-role' | 'needs-profile' | 'needs-email-verification';

export function RegistrationFlowGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [flowState, setFlowState] = useState<FlowState>('checking');

  useEffect(() => {
    if (loading) return;
    
    const checkFlowState = async () => {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        // Always fetch fresh data from database
        const response = await fetch('/api/user/registration-status');
        
        if (!response.ok) {
          console.error('Failed to fetch registration status');
          router.push('/auth/signin');
          return;
        }

        const data: RegistrationStatus = await response.json();

        // Check email verification first
        if (!data.userState.emailVerified) {
          setFlowState('needs-email-verification');
          router.push(`/auth/verify-email?email=${encodeURIComponent(user.email || '')}`);
          return;
        }

        // Check role selection
        if (data.needsRole) {
          setFlowState('needs-role');
          router.push('/role-selection');
          return;
        }

        // Check profile setup
        if (data.needsProfile) {
          setFlowState('needs-profile');
          router.push('/profile-setup');
          return;
        }

        // User has completed the flow
        setFlowState('complete');

      } catch (error) {
        console.error('Error checking registration status:', error);
        // On error, allow access but log the issue
        setFlowState('complete');
      }
    };

    checkFlowState();
  }, [user, loading, router]);

  if (loading || flowState === 'checking') {
    return <RegistrationFlowSpinner />;
  }

  return <>{children}</>;
}

/**
 * Simple loading spinner for the registration flow
 */
function RegistrationFlowSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Checking your account status...</p>
      </div>
    </div>
  );
}

/**
 * Guard for onboarding pages - prevents completed users from accessing them
 */
export function OnboardingPageGuard({ 
  children, 
  allowedStates 
}: { 
  children: React.ReactNode;
  allowedStates: FlowState[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    const checkAccess = async () => {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        const response = await fetch('/api/user/registration-status');
        const data: RegistrationStatus = await response.json();

        // If user is complete and this page doesn't allow complete users
        if (data.isComplete && !allowedStates.includes('complete')) {
          router.push('/dashboard');
          return;
        }

        // If user needs role but this page doesn't allow that state
        if (data.needsRole && !allowedStates.includes('needs-role')) {
          router.push('/role-selection');
          return;
        }

        // If user needs profile but this page doesn't allow that state
        if (data.needsProfile && !allowedStates.includes('needs-profile')) {
          router.push('/profile-setup');
          return;
        }

        setCanAccess(true);
      } catch (error) {
        console.error('Error checking onboarding access:', error);
        setCanAccess(true); // Allow access on error
      }
    };

    checkAccess();
  }, [user, loading, router, allowedStates]);

  if (loading || !canAccess) {
    return <RegistrationFlowSpinner />;
  }

  return <>{children}</>;
}
