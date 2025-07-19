import { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Custom hook for hamburger menu animations using GSAP
 * Provides smooth morphing between hamburger and X states with reversible animations
 */
export const useHamburgerAnimation = () => {
  // Store timeline references for each hamburger instance
  const timelinesRef = useRef<Map<HTMLDivElement, gsap.core.Timeline>>(new Map());

  /**
   * Animates a hamburger icon between open and closed states using reversible timeline
   * @param isOpen - Whether the menu is open (X state) or closed (hamburger state)
   * @param ref - React ref pointing to the hamburger container element
   */
  const animateHamburger = useCallback((isOpen: boolean, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    
    const element = ref.current;
    const lines = element.querySelectorAll('.hamburger-line');
    const [topLine, middleLine, bottomLine] = lines;
    
    // Get or create timeline for this hamburger instance
    let timeline = timelinesRef.current.get(element);
    
    if (!timeline) {
      // Create new timeline for opening animation
      timeline = gsap.timeline({ paused: true })
        .to(middleLine, { 
          scaleX: 0, 
          duration: 0.2, 
          ease: "power2.in" 
        })
        .to(topLine, { 
          top: '50%',
          y: '-50%',
          rotation: 45, 
          duration: 0.3, 
          ease: "back.out(1.7)" 
        }, "-=0.1")
        .to(bottomLine, { 
          bottom: '50%',
          y: '50%',
          rotation: -45, 
          duration: 0.3, 
          ease: "back.out(1.7)" 
        }, "-=0.3");
      
      // Store timeline for this element
      timelinesRef.current.set(element, timeline);
    }
    
    // Play forward or reverse based on state
    if (isOpen) {
      timeline.play();
    } else {
      timeline.reverse();
    }
  }, []);

  /**
   * Hook to automatically animate hamburger icons when menu state changes
   * @param isMenuOpen - Current state of the mobile menu
   * @param refs - Array of refs to hamburger icons that should be animated
   */
  const useHamburgerSync = (isMenuOpen: boolean, refs: React.RefObject<HTMLDivElement | null>[]) => {
    useEffect(() => {
      refs.forEach(ref => {
        animateHamburger(isMenuOpen, ref);
      });
    }, [isMenuOpen, refs]);
  };

  // Cleanup function to kill timelines when component unmounts
  const cleanup = useCallback(() => {
    timelinesRef.current.forEach(timeline => {
      timeline.kill();
    });
    timelinesRef.current.clear();
  }, []);

  return {
    animateHamburger,
    useHamburgerSync,
    cleanup
  };
};
