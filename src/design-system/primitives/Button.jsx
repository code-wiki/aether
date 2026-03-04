import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Button - Linear.app inspired button component
 * Features:
 * - Multiple variants (primary gradient, secondary, ghost, danger, purple)
 * - Responsive sizes (xs, sm, md, lg)
 * - Loading state with spinner
 * - Icon support (iconOnly mode for icon-only buttons)
 * - Smooth hover animations with accent glow
 * - Enhanced scale feedback on tap
 * - Perfect accessibility
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconOnly = false,
  onClick,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Logo-inspired vibrant variants
  const variantStyles = {
    // Primary: Pink to Purple gradient with vibrant glow
    primary: 'bg-gradient-to-r from-pink-500 via-pink-600 to-purple-500 text-white hover:from-pink-600 hover:via-pink-700 hover:to-purple-600 shadow-sm hover:shadow-glow-pink-md focus-visible:ring-pink-500',

    // Purple: Purple gradient with enhanced glow
    purple: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 shadow-sm hover:shadow-glow-purple-sm focus-visible:ring-purple-500',

    // Orange: Orange to Pink gradient
    orange: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-sm hover:shadow-glow-orange-md focus-visible:ring-orange-500',

    // Secondary: Subtle border with logo colors on hover
    secondary: 'bg-transparent border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:border-pink-500/50 focus-visible:ring-neutral-500',

    // Ghost: No background, subtle hover
    ghost: 'bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 focus-visible:ring-neutral-500',

    // Danger: Red from logo palette
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md focus-visible:ring-red-500',
  };

  const sizeStyles = {
    // Responsive sizing for touch accessibility (44px minimum on tablet/desktop)
    xs: 'px-2 py-1 text-xs gap-1 rounded-md h-6 sm:h-8',        // 24px mobile → 32px tablet
    sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-md h-8 sm:h-11',   // 32px mobile → 44px tablet
    md: 'px-4 py-2 text-sm gap-2 rounded-md h-11',               // 44px always (accessible)
    lg: 'px-5 py-2.5 text-base gap-2 rounded-lg h-12',           // 48px always (comfortable)
  };

  // Icon-only button styles (square aspect ratio)
  const iconOnlyStyles = iconOnly ? 'aspect-square !px-0 justify-center' : '';

  // Enhanced disabled styles (not just opacity)
  const disabledStyles = disabled || loading ? 'saturate-50 cursor-not-allowed' : '';

  return (
    <motion.button
      whileHover={!(disabled || loading) ? { y: -1 } : {}}
      whileTap={!(disabled || loading) ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        iconOnlyStyles,
        disabledStyles,
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <motion.svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </motion.svg>
      )}
      {icon && !loading && icon}
      {children}
    </motion.button>
  );
};

export default Button;
