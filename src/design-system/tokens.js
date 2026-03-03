// Aether Design System - Design Tokens
// Single source of truth for all design constants
// Linear.app-inspired design system

/**
 * Design tokens are the atomic building blocks of the design system.
 * They ensure consistency across the entire application.
 */

// Spacing scale (4px base unit)
export const space = {
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
};

// Border radius values
export const radius = {
  none: '0',
  sm: '4px',
  DEFAULT: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

// Transition durations and easings
export const transition = {
  // Duration
  duration: {
    instant: '100ms',
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy spring
  },

  // Common transition combinations
  default: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Z-index scale (layering system)
export const zIndex = {
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
};

// Breakpoints (mobile-first)
export const breakpoints = {
  sm: '640px',   // Mobile landscape, small tablets
  md: '768px',   // Tablets portrait
  lg: '1024px',  // Tablets landscape, small laptops
  xl: '1280px',  // Desktops, laptops
  '2xl': '1536px', // Large desktops
};

// Touch target sizes (accessibility)
export const touchTarget = {
  min: '44px',      // Minimum for mobile (iOS/Android standard)
  comfortable: '48px', // Comfortable for all devices
  large: '56px',    // Large touch targets
};

// Font weights
export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Line heights
export const lineHeight = {
  none: 1,
  tight: 1.2,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.8,
};

// Letter spacing
export const letterSpacing = {
  tighter: '-0.02em',
  tight: '-0.011em',
  normal: '-0.006em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// Icon sizes
export const iconSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
};

// Animation durations (Framer Motion)
export const animation = {
  duration: {
    instant: 0.1,
    fast: 0.15,
    base: 0.2,
    slow: 0.3,
    slower: 0.5,
  },

  // Spring configurations
  spring: {
    default: { type: 'spring', stiffness: 400, damping: 30 },
    snappy: { type: 'spring', stiffness: 500, damping: 35 },
    gentle: { type: 'spring', stiffness: 300, damping: 25 },
    bouncy: { type: 'spring', stiffness: 400, damping: 20 },
  },
};

// Export all tokens as a single object
export const tokens = {
  space,
  radius,
  transition,
  zIndex,
  breakpoints,
  touchTarget,
  fontWeight,
  lineHeight,
  letterSpacing,
  iconSize,
  animation,
};

export default tokens;
