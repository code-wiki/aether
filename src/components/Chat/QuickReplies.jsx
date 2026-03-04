import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * QuickReplies - Suggested follow-up questions (Claude-style)
 * Shows smart suggestions after AI responses
 */
function QuickReplies({ suggestions, onSelect, isMobile }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn(
        'mt-4 max-w-full md:max-w-3xl lg:max-w-4xl mx-auto px-3 md:px-4 lg:px-6'
      )}
    >
      {/* Header with sparkles icon */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className={cn(
          'text-blue-500',
          isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'
        )} />
        <span className={cn(
          'text-neutral-600 dark:text-neutral-400',
          isMobile ? 'text-xs' : 'text-xs font-medium'
        )}>
          Suggested follow-ups
        </span>
      </div>

      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(suggestion);
            }}
            className={cn(
              // Claude-style pill design
              'px-4 py-2 rounded-full border transition-all text-left',
              'bg-white dark:bg-neutral-900',
              'border-blue-200 dark:border-blue-800',
              'hover:bg-blue-50 dark:hover:bg-blue-950/30',
              'hover:border-blue-300 dark:hover:border-blue-700',
              'text-blue-600 dark:text-blue-400',
              isMobile ? 'text-xs' : 'text-sm',
              'shadow-sm hover:shadow-md'
            )}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default QuickReplies;
