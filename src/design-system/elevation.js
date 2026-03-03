// Aether Design System - Elevation & Shadows
// Depth and layering system with Linear.app-inspired shadows
// Includes both standard shadows and accent glow effects

/**
 * Elevation system creates visual hierarchy through shadows and depth.
 * Use elevation to indicate interactivity, focus states, and layering.
 *
 * Usage:
 * import { elevation } from '../design-system/elevation';
 * <div className={elevation.raised}>Card</div>
 */

// Standard shadow elevations
export const shadow = {
  // Flat - No shadow (disabled states, backgrounds)
  none: 'shadow-none',

  // Subtle - Minimal depth (cards at rest, subtle borders)
  subtle: 'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',

  // Small - Slight lift (buttons, small cards)
  sm: 'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]',

  // Default - Standard elevation (cards, dropdowns)
  DEFAULT: 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.06)]',

  // Medium - Clear elevation (popovers, floating elements)
  md: 'shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]',

  // Large - Prominent elevation (modals, drawers)
  lg: 'shadow-[0_12px_24px_-6px_rgba(0,0,0,0.12),0_8px_12px_-4px_rgba(0,0,0,0.08)]',

  // Extra large - Maximum elevation (overlays, full-screen modals)
  xl: 'shadow-[0_20px_40px_-8px_rgba(0,0,0,0.15),0_12px_20px_-6px_rgba(0,0,0,0.1)]',

  // 2XL - Dramatic depth (hero elements)
  '2xl': 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
};

// Accent glow effects (Linear.app signature)
export const glow = {
  // Accent color glows (cyan)
  accent: {
    subtle: 'shadow-[0_0_20px_rgba(0,184,230,0.15)]',
    medium: 'shadow-[0_0_30px_rgba(0,184,230,0.25)]',
    strong: 'shadow-[0_0_40px_rgba(0,184,230,0.35)]',
    intense: 'shadow-[0_0_60px_rgba(0,184,230,0.5)]',
  },

  // Purple glows (premium feel)
  purple: {
    subtle: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    medium: 'shadow-[0_0_30px_rgba(139,92,246,0.25)]',
    strong: 'shadow-[0_0_40px_rgba(139,92,246,0.35)]',
  },

  // Success glow
  success: {
    subtle: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    medium: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
  },

  // Error glow
  error: {
    subtle: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    medium: 'shadow-[0_0_30px_rgba(239,68,68,0.25)]',
  },
};

// Focus ring styles (accessibility)
export const focus = {
  // Default focus ring
  default: 'focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:ring-offset-2 focus:ring-offset-background',

  // Accent focus (cyan)
  accent: 'focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 focus:ring-offset-background',

  // Purple focus
  purple: 'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-background',

  // Success focus
  success: 'focus:outline-none focus:ring-2 focus:ring-success-500/50 focus:ring-offset-2 focus:ring-offset-background',

  // Error focus
  error: 'focus:outline-none focus:ring-2 focus:ring-error-500/50 focus:ring-offset-2 focus:ring-offset-background',

  // Inset focus (for buttons)
  inset: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500/50',

  // No offset (for compact elements)
  tight: 'focus:outline-none focus:ring-2 focus:ring-accent-500/50',
};

// Elevation levels with semantic names
export const elevation = {
  // Flat - No elevation (backgrounds, disabled)
  flat: shadow.none,

  // Raised - Slight lift (cards, buttons)
  raised: `${shadow.sm} hover:shadow-md transition-shadow duration-200`,

  // Floating - Clear separation (dropdowns, tooltips)
  floating: shadow.lg,

  // Modal - Maximum depth (modals, overlays)
  modal: shadow.xl,

  // Interactive - Responds to hover
  interactive: `${shadow.sm} hover:${shadow.md} active:${shadow.sm} transition-shadow duration-150`,

  // Focus states with accent glow
  focusAccent: `${focus.accent} ${shadow.sm}`,
  focusPurple: `${focus.purple} ${shadow.sm}`,

  // Premium elevation (combines shadow + glow)
  premium: `${shadow.md} ${glow.purple.subtle} hover:${glow.purple.medium} transition-shadow duration-300`,

  // Active states (when element is selected)
  active: `${shadow.md} ${glow.accent.subtle}`,
};

// Border styles (subtle elevation alternative)
export const border = {
  // Standard borders
  default: 'border border-neutral-200 dark:border-neutral-800',
  strong: 'border-2 border-neutral-300 dark:border-neutral-700',

  // Accent borders
  accent: 'border border-accent-500/50',
  accentStrong: 'border-2 border-accent-500',

  // Interactive borders
  interactive: 'border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors',

  // Focus borders
  focus: 'border-2 border-accent-500',
};

// Glassmorphism effects (frosted glass)
export const glass = {
  // Light glass (for light backgrounds)
  light: 'bg-white/80 backdrop-blur-md border border-white/20',

  // Dark glass (for dark backgrounds)
  dark: 'bg-neutral-900/80 backdrop-blur-md border border-white/10',

  // Adaptive glass (responds to theme)
  adaptive: 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/50',

  // Strong blur
  strong: 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50',
};

// Combined elevation presets (common use cases)
export const presets = {
  // Card preset (raised elevation + border)
  card: `${elevation.raised} ${border.default} rounded-lg`,

  // Button preset (interactive elevation + focus)
  button: `${elevation.interactive} ${focus.default}`,

  // Input preset (inset appearance + focus ring)
  input: `${border.interactive} ${focus.accent} rounded-md`,

  // Modal preset (max elevation + backdrop blur)
  modal: `${elevation.modal} ${glass.strong} rounded-xl`,

  // Dropdown preset (floating elevation + border)
  dropdown: `${elevation.floating} ${border.default} rounded-lg`,

  // Premium card (shadow + glow + border)
  premiumCard: `${shadow.md} ${glow.purple.subtle} ${border.default} rounded-lg hover:${glow.purple.medium} transition-all duration-300`,
};

// Export all elevation styles
export { shadow, glow, focus, elevation, border, glass, presets };

export default {
  shadow,
  glow,
  focus,
  elevation,
  border,
  glass,
  presets,
};
