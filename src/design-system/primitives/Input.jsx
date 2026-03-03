import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * Input - Linear.app inspired input component
 * Features:
 * - Floating label animation (Linear.app style)
 * - Accent glow on focus
 * - Smooth error state transitions
 * - Size variants (sm, md, lg)
 * - Better focus ring
 * - Icon support
 * - Dark mode support
 * - Perfect typography
 */
const Input = ({
  type = 'text',
  placeholder,
  label,
  value,
  onChange,
  disabled = false,
  error = false,
  errorMessage,
  icon = null,
  size = 'md',
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  // Label should float when input has value or is focused
  const labelFloating = isFocused || (value && value.length > 0);

  // Size variants - Responsive heights for touch accessibility (44px minimum on tablet/desktop)
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs h-8 md:h-11',  // 32px mobile → 44px tablet
    md: 'px-3 py-2 text-sm h-10 md:h-11',     // 40px mobile → 44px tablet
    lg: 'px-4 py-2.5 text-base h-12',          // 48px (always accessible)
  };

  // Linear.app inspired styling with accent glow on focus
  const baseStyles = 'w-full bg-white dark:bg-neutral-900 border rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const borderStyles = error
    ? 'border-red-500 focus:ring-2 focus:ring-red-500/40 focus:border-red-500'
    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 focus:shadow-glow-accent-sm focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500';

  return (
    <div className="relative w-full">
      {label && (
        <motion.label
          className="absolute left-3 text-neutral-500 dark:text-neutral-400 pointer-events-none origin-left"
          animate={{
            y: labelFloating ? -24 : size === 'sm' ? 6 : size === 'lg' ? 14 : 10,
            scale: labelFloating ? 0.85 : 1,
            color: isFocused
              ? error
                ? '#EF4444'
                : 'var(--color-accent-primary)'
              : 'var(--color-text-tertiary)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {label}
        </motion.label>
      )}
      {icon && (
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={!label ? placeholder : ''}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={clsx(
          baseStyles,
          borderStyles,
          sizeStyles[size],
          icon && 'pl-9',
          className
        )}
        {...props}
      />
      {error && errorMessage && (
        <motion.p
          className="mt-1 text-xs text-red-500"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {errorMessage}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
