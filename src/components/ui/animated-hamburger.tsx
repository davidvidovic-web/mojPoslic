import React from 'react';

interface AnimatedHamburgerProps {
  ref: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

/**
 * Animated hamburger icon component
 * Uses GSAP animations via the useHamburgerAnimation hook
 * 
 * @param ref - React ref for GSAP animation targeting
 * @param className - Additional CSS classes
 */
export const AnimatedHamburger = React.memo<AnimatedHamburgerProps>(({ ref, className = "" }) => (
  <div ref={ref} className={`relative h-7 w-7 flex flex-col justify-center items-center ${className}`}>
    {/* Top line */}
    <span 
      className="hamburger-line absolute h-0.5 w-5 bg-current rounded-full top-2" 
    />
    {/* Middle line */}
    <span 
      className="hamburger-line absolute h-0.5 w-5 bg-current rounded-full top-1/2 -translate-y-1/2" 
    />
    {/* Bottom line */}
    <span 
      className="hamburger-line absolute h-0.5 w-5 bg-current rounded-full bottom-2" 
    />
  </div>
));

AnimatedHamburger.displayName = 'AnimatedHamburger';
