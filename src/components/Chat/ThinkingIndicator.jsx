import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image as ImageIcon, BarChart3, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * ThinkingIndicator - Shows AI thinking/processing status
 * Displays different states: thinking, generating image, generating chart, etc.
 */
function ThinkingIndicator({ type = 'thinking', tool = null, isMobile = false }) {
  const getIconAndLabel = () => {
    if (tool) {
      switch (tool) {
        case 'image-generation':
          return {
            icon: ImageIcon,
            label: 'Generating image',
            color: 'text-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-950/30',
          };
        case 'chart-generation':
          return {
            icon: BarChart3,
            label: 'Creating chart',
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
          };
        default:
          return {
            icon: Sparkles,
            label: 'Using tool',
            color: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          };
      }
    }

    // Default thinking state
    return {
      icon: Loader2,
      label: 'Thinking',
      color: 'text-neutral-500',
      bgColor: 'bg-neutral-100 dark:bg-neutral-800',
    };
  };

  const { icon: Icon, label, color, bgColor } = getIconAndLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5',
        bgColor,
        isMobile ? 'text-xs' : 'text-sm'
      )}
    >
      <Icon className={cn('w-4 h-4', color, tool === null && 'animate-spin')} />
      <span className={cn('font-medium', color)}>{label}</span>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn('w-1 h-1 rounded-full', color.replace('text-', 'bg-'))}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default ThinkingIndicator;
