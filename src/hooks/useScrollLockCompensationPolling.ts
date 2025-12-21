import { useEffect } from 'react';

/**
 * Alternative approach using polling to detect body overflow changes
 * Applies padding to html element instead of body for better results
 */
export function useScrollLockCompensationPolling() {
  useEffect(() => {
    // Only run on desktop
    if (typeof window === 'undefined' || window.innerWidth < 768) {
      return;
    }

    let originalPaddingRight: string = '';
    let lastOverflowState: string = '';
    let isCompensating = false;
    
    // Calculate scrollbar width once
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const checkBodyOverflow = () => {
      const body = document.body;
      const html = document.documentElement;
      const computedStyle = window.getComputedStyle(body);
      const currentOverflow = computedStyle.overflow || body.style.overflow || '';
      
      // Only act if overflow state changed
      if (currentOverflow === lastOverflowState) {
        return;
      }
      
      lastOverflowState = currentOverflow;
      
      if (currentOverflow === 'hidden') {
        // Apply compensation to html element instead of body
        if (!isCompensating && scrollbarWidth > 0) {
          originalPaddingRight = html.style.paddingRight || '';
          html.style.paddingRight = `${scrollbarWidth}px`;
          isCompensating = true;
        }
      } else {
        // Remove compensation
        if (isCompensating) {
          html.style.paddingRight = originalPaddingRight;
          isCompensating = false;
        }
      }
    };

    // Check immediately
    checkBodyOverflow();
    
    // Poll every 100ms
    const interval = setInterval(checkBodyOverflow, 100);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (isCompensating) {
        document.documentElement.style.paddingRight = originalPaddingRight;
      }
    };
  }, []);
}
