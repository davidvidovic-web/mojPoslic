import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuthTransfer() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if we're in a transfer state (just completed cross-domain auth)
    const urlParams = new URLSearchParams(window.location.search);
    const wasTransferred = urlParams.has('transferred');

    if (wasTransferred && status === 'authenticated') {
      // Clean up URL parameters and refresh the page to ensure proper state
      const cleanUrl = window.location.pathname;
      router.replace(cleanUrl);
    }
  }, [session, status, router]);
}
