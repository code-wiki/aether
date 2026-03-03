// Aether Design System - Typography
// Inter font family with clear hierarchy
// Linear.app-inspired typography system with semantic class utilities

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
  },

  // Font sizes (based on modular scale)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.011em',
    normal: '-0.006em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Typography presets for common use cases
export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
  },

  // Body text
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  // UI text
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  // Code
  code: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
};

// Semantic typography class utilities (TailwindCSS)
// These provide ready-to-use class combinations for common text patterns

export const display = {
  hero: 'text-5xl md:text-6xl font-bold tracking-tight leading-tight',
  large: 'text-4xl md:text-5xl font-bold tracking-tight leading-tight',
  medium: 'text-3xl md:text-4xl font-semibold tracking-tight leading-snug',
  small: 'text-2xl md:text-3xl font-semibold tracking-tight leading-snug',
};

export const heading = {
  h1: 'text-2xl md:text-3xl font-semibold tracking-tight leading-snug',
  h2: 'text-xl md:text-2xl font-semibold tracking-tight leading-snug',
  h3: 'text-lg md:text-xl font-medium tracking-tight leading-normal',
  h4: 'text-base md:text-lg font-medium leading-normal',
  h5: 'text-sm md:text-base font-medium leading-normal',
  h6: 'text-xs md:text-sm font-medium leading-normal',
};

export const body = {
  xlarge: 'text-lg md:text-xl leading-relaxed',
  large: 'text-base md:text-lg leading-relaxed',
  default: 'text-sm md:text-base leading-relaxed',
  small: 'text-xs md:text-sm leading-normal',
  xsmall: 'text-xs leading-normal',
};

export const label = {
  large: 'text-base font-medium leading-none',
  default: 'text-sm font-medium leading-none',
  small: 'text-xs font-medium leading-none',
  uppercase: 'text-xs font-medium tracking-wider uppercase leading-none',
};

export const code = {
  inline: 'font-mono text-xs bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-sm border border-neutral-200 dark:border-neutral-800',
  block: 'font-mono text-sm leading-relaxed',
};

export const caption = {
  default: 'text-xs text-neutral-600 dark:text-neutral-400 leading-normal',
  small: 'text-xs text-neutral-500 dark:text-neutral-500 leading-tight',
};

export const link = {
  default: 'text-accent-500 hover:text-accent-600 dark:text-accent-400 dark:hover:text-accent-300 underline-offset-2 hover:underline transition-colors',
  subtle: 'text-neutral-700 dark:text-neutral-300 hover:text-accent-500 dark:hover:text-accent-400 transition-colors',
};

export const gradient = {
  accent: 'bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent',
  purple: 'bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent',
  sunset: 'bg-gradient-to-r from-accent-500 via-purple-500 to-purple-600 bg-clip-text text-transparent',
};

export default typography;
