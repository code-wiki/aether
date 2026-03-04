import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Edit2, GitFork, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

/**
 * MessageActions - Enhanced action buttons for messages
 * Features: Copy, Edit, Regenerate, Branch, Feedback (thumbs up/down)
 */
function MessageActions({
  message,
  onCopy,
  onEdit,
  onRegenerate,
  onBranch,
  onFeedback,
  isUser,
  isMobile
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(message.feedback || null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(message);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFeedback = (type) => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);
    onFeedback?.(message.id, newFeedback);
  };

  if (isMobile) {
    return (
      <div className="flex items-center gap-1 mt-2">
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            'p-1.5 rounded transition-colors',
            copied
              ? 'text-green-600 dark:text-green-400'
              : isUser
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
          title={copied ? 'Copied!' : 'Copy'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Edit (user only) */}
        {isUser && (
          <button
            onClick={() => onEdit?.(message)}
            className="p-1.5 rounded transition-colors text-white/70 hover:text-white hover:bg-white/10"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        {/* Regenerate (assistant only) */}
        {!isUser && (
          <button
            onClick={() => onRegenerate?.(message)}
            className="p-1.5 rounded transition-colors text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Regenerate"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Feedback buttons (assistant only) */}
        {!isUser && (
          <div className="flex items-center gap-0.5 ml-auto">
            <button
              onClick={() => handleFeedback('positive')}
              className={cn(
                'p-1.5 rounded transition-all',
                feedback === 'positive'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
              title="Good response"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback('negative')}
              className={cn(
                'p-1.5 rounded transition-all',
                feedback === 'negative'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
              title="Poor response"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop version - always visible action bar (Claude-style)
  return (
    <div
      className={cn(
        'flex items-center gap-1 mt-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className="flex items-center gap-0.5 bg-transparent border-0 rounded-full px-0 py-0">
        {/* Copy */}
        <button
          onClick={handleCopy}
          className={cn(
            'p-1.5 rounded transition-all',
            copied
              ? 'text-green-600 dark:text-green-400'
              : isUser
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
          title={copied ? 'Copied!' : 'Copy'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Edit (user only) */}
        {isUser && (
          <button
            onClick={() => onEdit?.(message)}
            className="p-1.5 rounded transition-all text-white/70 hover:text-white hover:bg-white/10"
            title="Edit message"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        {/* Regenerate (assistant only) */}
        {!isUser && (
          <button
            onClick={() => onRegenerate?.(message)}
            className="p-1.5 rounded transition-all text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Regenerate response"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Branch */}
        <button
          onClick={() => onBranch?.(message)}
          className={cn(
            'p-1.5 rounded transition-all',
            isUser
              ? 'text-white/70 hover:text-white hover:bg-white/10'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
          title="Branch conversation"
        >
          <GitFork className="w-4 h-4" />
        </button>

        {/* Feedback buttons (assistant only) */}
        {!isUser && (
          <>
            <button
              onClick={() => handleFeedback('positive')}
              className={cn(
                'p-1.5 rounded transition-all',
                feedback === 'positive'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300'
              )}
              title="Good response"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback('negative')}
              className={cn(
                'p-1.5 rounded transition-all',
                feedback === 'negative'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300'
              )}
              title="Poor response"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MessageActions;
