import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Card - Linear.app inspired card component
 * Features:
 * - Multiple variants (default, elevated, glass, interactive)
 * - Subtle borders and shadows with accent glow option
 * - Smooth hover effects with lift
 * - Interactive variant for clickable cards
 * - Responsive padding
 * - Spring animations
 * - Dark mode support
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  interactive = false,
  glow = false,
  className,
  onClick,
  ...props
}) => {
  // Linear.app inspired base styles - clean, minimal
  const baseStyles = 'bg-white dark:bg-neutral-900 transition-all';

  // Subtle variants with refined shadows
  const variantStyles = {
    // Default: Subtle border
    default: 'border border-neutral-200 dark:border-neutral-800 rounded-lg',

    // Elevated: Subtle shadow + border (Linear-style)
    elevated: 'border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:shadow-md',

    // Glass: Backdrop blur with transparency
    glass: 'backdrop-blur-xl bg-white/80 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-700/50 shadow-md rounded-lg',

    // Interactive: Optimized for clickable cards
    interactive: clsx(
      'border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm',
      'hover:shadow-md hover:border-accent-500/50 cursor-pointer'
    ),
  };

  const paddingStyles = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Glow styles for accent glow on hover
  const glowStyles = glow
    ? 'hover:shadow-glow-accent-md hover:border-accent-500/30'
    : '';

  // Legacy hoverable support (prefer using interactive variant now)
  const hoverStyles = hoverable
    ? 'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer'
    : '';

  // Use motion component for interactive or hoverable cards
  const shouldAnimate = hoverable || interactive || glow;
  const Component = shouldAnimate ? motion.div : 'div';
  const motionProps = shouldAnimate ? {
    whileHover: { y: -3, scale: 1.005 },
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  } : {};

  return (
    <Component
      className={clsx(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        glowStyles,
        hoverStyles,
        className
      )}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
