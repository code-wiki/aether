// Aether Design System - Color Palette
// Linear-inspired color system with expanded scales

export const colors = {
  // Neutral scale (0-1000) - for backgrounds, text, borders
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
    1000: '#000000',
  },

  // Accent scale (50-900) - Primary brand color (Cyan)
  accent: {
    50: '#E0F7FF',
    100: '#B8EEFF',
    200: '#7FE3FF',
    300: '#47D7FF',
    400: '#1ACCFF',
    500: '#00B8E6',  // Primary
    600: '#0099BF',
    700: '#007A99',
    800: '#005C73',
    900: '#003D4D',
  },

  // Semantic colors
  success: {
    50: '#ECFDF5',
    500: '#10B981',
    700: '#047857',
  },

  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    700: '#B45309',
  },

  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    700: '#B91C1C',
  },

  // Special effects
  glass: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(0, 0, 0, 0.4)',
  },
};

// Glow effects - Linear.app inspired subtle illumination
export const glows = {
  accent: {
    subtle: '0 0 20px rgba(0, 184, 230, 0.15)',
    medium: '0 0 30px rgba(0, 184, 230, 0.25)',
    strong: '0 0 40px rgba(0, 184, 230, 0.35)',
  },
  purple: {
    subtle: '0 0 20px rgba(139, 92, 246, 0.15)',
    medium: '0 0 30px rgba(139, 92, 246, 0.25)',
  },
};

// Surface variants for depth and elevation
export const surfaces = {
  light: {
    default: colors.neutral[50],
    elevated: colors.neutral[0],      // Cards that lift above background
    sunken: colors.neutral[100],      // Input fields, wells
    overlay: 'rgba(255, 255, 255, 0.95)', // Modals, popovers
  },
  dark: {
    default: colors.neutral[900],
    elevated: colors.neutral[800],
    sunken: colors.neutral[950],
    overlay: 'rgba(0, 0, 0, 0.95)',
  },
};

// Semantic color mappings for light theme
export const lightTheme = {
  background: colors.neutral[0],
  surface: colors.neutral[50],
  surfaceHover: colors.neutral[100],
  surfaceElevated: surfaces.light.elevated,
  surfaceSunken: surfaces.light.sunken,
  surfaceOverlay: surfaces.light.overlay,
  border: colors.neutral[200],
  borderHover: colors.neutral[300],
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[400],
    inverse: colors.neutral[0],
  },
  accent: {
    primary: colors.accent[500],
    hover: colors.accent[600],
    light: colors.accent[50],
  },
};

// Semantic color mappings for dark theme
export const darkTheme = {
  background: colors.neutral[1000],
  surface: colors.neutral[900],
  surfaceHover: colors.neutral[800],
  surfaceElevated: surfaces.dark.elevated,
  surfaceSunken: surfaces.dark.sunken,
  surfaceOverlay: surfaces.dark.overlay,
  border: colors.neutral[800],
  borderHover: colors.neutral[700],
  text: {
    primary: colors.neutral[0],
    secondary: colors.neutral[400],
    tertiary: colors.neutral[600],
    inverse: colors.neutral[1000],
  },
  accent: {
    primary: colors.accent[400],
    hover: colors.accent[300],
    light: colors.accent[900],
  },
};

export { glows, surfaces };
export default colors;
