import { useMediaQuery } from './useMediaQuery';

/**
 * Responsive breakpoint hooks based on Tailwind config
 * Provides convenient boolean values for each breakpoint
 */
export function useResponsive() {
  const isMobile = !useMediaQuery('(min-width: 640px)');      // < 640px
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');  // 640-1023px
  const isDesktop = useMediaQuery('(min-width: 1024px)');     // >= 1024px
  const isLargeDesktop = useMediaQuery('(min-width: 1536px)'); // >= 1536px

  // Additional breakpoint checks
  const isSm = useMediaQuery('(min-width: 640px)');   // >= 640px
  const isMd = useMediaQuery('(min-width: 768px)');   // >= 768px
  const isLg = useMediaQuery('(min-width: 1024px)');  // >= 1024px
  const isXl = useMediaQuery('(min-width: 1280px)');  // >= 1280px
  const is2Xl = useMediaQuery('(min-width: 1536px)'); // >= 1536px

  return {
    // Device type checks
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,

    // Breakpoint checks (>= breakpoint)
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,

    // Convenience
    isTouch: isMobile || isTablet,
    showSidebar: isDesktop, // Show sidebar by default on desktop
  };
}
