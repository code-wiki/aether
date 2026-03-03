import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Skeleton Loading Components
 * Linear.app-inspired skeleton screens for better perceived performance
 *
 * Usage:
 * - Show skeleton while content is loading
 * - Replace spinners for a more premium feel
 * - Maintain layout to prevent content shift
 */

/**
 * Base Skeleton component
 * Animated placeholder for loading content
 */
export const Skeleton = ({ className, variant = 'default', animate = true }) => {
  const variants = {
    default: 'bg-neutral-200 dark:bg-neutral-800',
    light: 'bg-neutral-100 dark:bg-neutral-900',
    strong: 'bg-neutral-300 dark:bg-neutral-700',
  };

  const pulseAnimation = animate
    ? {
        opacity: [0.5, 1, 0.5],
      }
    : {};

  return (
    <motion.div
      animate={pulseAnimation}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn('rounded', variants[variant], className)}
      aria-label="Loading..."
      role="status"
    />
  );
};

/**
 * Message Skeleton
 * Loading placeholder for chat messages
 */
export const MessageSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-6 p-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="space-y-3">
          {/* Avatar and name */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Message content */}
          <div className="space-y-2 ml-11">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Conversation Card Skeleton
 * Loading placeholder for conversation list items
 */
export const ConversationSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-2 p-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-3 space-y-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
          {/* Title */}
          <Skeleton className="h-4 w-2/3" />
          {/* Subtitle/preview */}
          <Skeleton className="h-3 w-1/2" variant="light" />
          {/* Metadata */}
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-3 w-16" variant="light" />
            <Skeleton className="h-3 w-3 rounded-full" variant="light" />
            <Skeleton className="h-3 w-20" variant="light" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Settings Panel Skeleton
 * Loading placeholder for settings sections
 */
export const SettingsSkeleton = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Section 1 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" /> {/* Section title */}
        <div className="space-y-3">
          <div>
            <Skeleton className="h-4 w-24 mb-2" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Table Skeleton
 * Loading placeholder for data tables
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" variant="light" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Card Skeleton
 * Loading placeholder for card components
 */
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="p-6 space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-800"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" variant="light" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" variant="light" />
            <Skeleton className="h-3 w-5/6" variant="light" />
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Avatar Skeleton
 * Loading placeholder for user avatars
 */
export const AvatarSkeleton = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton className={cn('rounded-full', sizes[size])} />;
};

/**
 * Text Skeleton
 * Loading placeholder for text content with multiple lines
 */
export const TextSkeleton = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {[...Array(lines)].map((_, i) => {
        // Vary the width of each line for natural look
        const widths = ['w-full', 'w-11/12', 'w-5/6', 'w-3/4', 'w-2/3'];
        const width = widths[i % widths.length];

        return <Skeleton key={i} className={cn('h-3', width)} variant="light" />;
      })}
    </div>
  );
};

/**
 * Button Skeleton
 * Loading placeholder for buttons
 */
export const ButtonSkeleton = ({ size = 'md', variant = 'default' }) => {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-28',
  };

  return <Skeleton className={cn('rounded-lg', sizes[size])} variant={variant} />;
};

// Export all skeleton components
export default {
  Skeleton,
  MessageSkeleton,
  ConversationSkeleton,
  SettingsSkeleton,
  TableSkeleton,
  CardSkeleton,
  AvatarSkeleton,
  TextSkeleton,
  ButtonSkeleton,
};
