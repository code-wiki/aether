/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape, small tablets
      'md': '768px',   // Tablets portrait
      'lg': '1024px',  // Tablets landscape, small laptops
      'xl': '1280px',  // Desktops, laptops
      '2xl': '1536px', // Large desktops
    },
    extend: {
      // Expanded color palette from design system
      colors: {
        // Neutral scale (0-1000) - Linear.app inspired cooler grays
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
          1000: '#000000',
        },
        // Accent scale (Cyan - Primary brand color)
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
        // Purple accent - Premium feel
        purple: {
          400: '#C4B5FD',
          500: '#A78BFA',
          600: '#8B5CF6',
          700: '#7C3AED',
          800: '#6D28D9',
          900: '#5B21B6',
        },
        // Legacy CSS variable support (for gradual migration)
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
          elevated: 'var(--color-surface-elevated)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          hover: 'var(--color-border-hover)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
        },
      },
      // Typography system - Linear.app inspired with line-heights
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.4', letterSpacing: '-0.006em' }],      // 12px - captions
        sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '-0.006em' }],     // 14px - body
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '-0.006em' }],       // 16px - body
        lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.006em' }],     // 18px - large body
        xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.011em' }],      // 20px - headings
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.011em' }],    // 24px - h1
        '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.011em' }],  // 30px - display
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.011em' }],   // 36px - display
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.011em' }],      // 48px - hero
      },
      // Spacing scale - Linear.app style with micro spacing
      spacing: {
        'px': '1px',
        '0': '0',
        '0.5': '2px',     // Micro spacing
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
        '40': '160px',
        '48': '192px',
        '56': '224px',
        '64': '256px',
      },
      // Border radius - Linear.app style subtle curves
      borderRadius: {
        'none': '0',
        'sm': '4px',      // Buttons, inputs
        'DEFAULT': '6px', // Cards
        'md': '8px',      // Panels
        'lg': '12px',     // Modals
        'xl': '16px',     // Large containers
        'full': '9999px', // Pills, avatars
      },
      // Box shadow - Linear.app style subtle shadows + accent glows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'none': 'none',
        // Accent glow variants
        'glow-accent-sm': '0 0 20px rgba(0, 184, 230, 0.15)',
        'glow-accent-md': '0 0 30px rgba(0, 184, 230, 0.25)',
        'glow-accent-lg': '0 0 40px rgba(0, 184, 230, 0.35)',
        'glow-purple-sm': '0 0 20px rgba(139, 92, 246, 0.15)',
        'glow-purple-md': '0 0 30px rgba(139, 92, 246, 0.25)',
      },
      // Glassmorphism support
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      // Gradients - Premium background variants
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, rgba(0, 184, 230, 0.1) 0%, rgba(0, 184, 230, 0.05) 100%)',
        'gradient-purple': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        'gradient-neutral': 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-hover))',
      },
      // Ring colors for focus states
      ringColor: {
        'accent': 'rgba(0, 184, 230, 0.4)',
        'purple': 'rgba(139, 92, 246, 0.4)',
      },
      ringOffsetColor: {
        'background': 'var(--color-background)',
      },
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 184, 230, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 184, 230, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
