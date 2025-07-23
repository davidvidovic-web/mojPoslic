import { useEffect } from 'react';

/**
 * Custom hook to prevent layout shift when scroll is locked by modals/dialogs
 * Only applies on desktop where scrollbars are visible
 */
export function useScrollLockCompensation() {
  useEffect(() => {
    // Only run on desktop
    if (typeof window === 'undefined' || window.innerWidth < 768) {
      console.log('ScrollLockCompensation: Skipping - mobile or SSR');
      return;
    }

    console.log('ScrollLockCompensation: Initializing');
    let originalPaddingRight: string | undefined;
    let scrollbarWidth: number;

    const handleBodyOverflowChange = () => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      
      console.log('ScrollLockCompensation: Body style change detected', {
        computedOverflow: computedStyle.overflow,
        bodyStyleOverflow: body.style.overflow,
        bodyStyle: body.style.cssText
      });
      
      if (computedStyle.overflow === 'hidden' || body.style.overflow === 'hidden') {
        // Calculate scrollbar width if not already done
        if (scrollbarWidth === undefined) {
          scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
          console.log('ScrollLockCompensation: Calculated scrollbar width:', scrollbarWidth);
        }
        
        // Store original padding and apply compensation
        if (originalPaddingRight === undefined) {
          originalPaddingRight = body.style.paddingRight || '';
          console.log('ScrollLockCompensation: Stored original padding:', originalPaddingRight);
        }
        
        if (scrollbarWidth > 0) {
          body.style.paddingRight = `${scrollbarWidth}px`;
          console.log('ScrollLockCompensation: Applied padding compensation:', scrollbarWidth + 'px');
        }
      } else {
        // Restore original padding when overflow is restored
        if (originalPaddingRight !== undefined) {
          body.style.paddingRight = originalPaddingRight;
          console.log('ScrollLockCompensation: Restored original padding:', originalPaddingRight);
          originalPaddingRight = undefined;
        }
      }
    };

    // Create a MutationObserver to watch for style changes on the body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          console.log('ScrollLockCompensation: Style mutation detected');
          handleBodyOverflowChange();
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });

    console.log('ScrollLockCompensation: Observer started');

    // Cleanup
    return () => {
      observer.disconnect();
      if (originalPaddingRight !== undefined) {
        document.body.style.paddingRight = originalPaddingRight;
      }
      console.log('ScrollLockCompensation: Cleanup completed');
    };
  }, []);
}
