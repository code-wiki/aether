import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { User, Bot, Copy, Check } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';
import CodeBlock from './CodeBlock';
import { Badge } from '../../design-system/primitives';
import { hoverLift } from '../../design-system/motion';
import { cn } from '../../lib/utils';

/**
 * MessageCard - Enhanced responsive message component
 * Features:
 * - Responsive design (mobile → desktop)
 * - Model badge
 * - Timestamp
 * - Copy action
 * - Smooth animations
 * - Markdown rendering with syntax highlighting
 * - Linear.app inspired clean design
 * - React.memo for performance
 */
const MessageCard = memo(({ message, isLatest, isStreaming, isMobile }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      {...hoverLift}
      className={cn(
        'flex group',
        isMobile ? 'gap-2' : 'gap-3 md:gap-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar - responsive size */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'rounded-full flex items-center justify-center',
            isMobile ? 'w-8 h-8' : 'w-9 h-9 md:w-10 md:h-10',
            isUser
              ? 'bg-accent-500 text-white'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
          )}
        >
          {isUser ? (
            <User className={cn(isMobile ? 'w-4 h-4' : 'w-4.5 h-4.5 md:w-5 md:h-5')} />
          ) : (
            <Bot className={cn(isMobile ? 'w-4 h-4' : 'w-4.5 h-4.5 md:w-5 md:h-5')} />
          )}
        </div>
      </div>

      {/* Message Content - Ensure proper wrapping without shrinking parent */}
      <div className={cn(
        'flex-1 flex flex-col overflow-hidden',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Header - responsive */}
        <div className={cn(
          'flex items-center mb-1',
          isMobile ? 'gap-1.5' : 'gap-2',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className={cn(
            'font-medium text-neutral-900 dark:text-neutral-0',
            isMobile ? 'text-xs' : 'text-sm'
          )}>
            {isUser ? 'You' : 'AI'}
          </span>

          {!isMobile && message.timestamp && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatTimestamp(message.timestamp)}
            </span>
          )}

          {!isMobile && isAssistant && message.model && (
            <Badge variant="default" size="sm">
              {message.model}
            </Badge>
          )}

          {isLatest && isStreaming && (
            <Badge variant="primary" size={isMobile ? 'xs' : 'sm'} className="animate-pulse">
              {isMobile ? '...' : 'Typing...'}
            </Badge>
          )}
        </div>

        {/* Message Bubble - Linear.app inspired with responsive sizing and gradients */}
        <div
          className={cn(
            'relative shadow-sm',
            // Responsive width and padding
            'max-w-[90%] md:max-w-[85%]',
            isMobile ? 'px-3 py-2 rounded-xl' : 'px-4 py-3 rounded-xl md:rounded-2xl',
            // User message styling
            isUser && 'bg-accent-500 text-white rounded-tr-sm shadow-accent-500/10',
            // AI message styling - Linear.app inspired with subtle gradient
            !isUser && 'bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-tl-sm'
          )}
        >
          {/* Content - Force text wrapping */}
          {isUser ? (
            <p className={cn(
              'whitespace-pre-wrap break-words overflow-wrap-anywhere',
              isMobile ? 'text-sm' : 'text-sm md:text-base'
            )}>
              {message.content}
            </p>
          ) : (
            <div className={cn(
              'prose dark:prose-invert max-w-none break-words',
              isMobile ? 'prose-sm' : 'prose-sm',
              // Linear-style prose
              'prose-headings:font-semibold prose-headings:tracking-tight',
              'prose-p:text-neutral-700 dark:prose-p:text-neutral-300',
              'prose-a:text-accent-600 dark:prose-a:text-accent-400',
              'prose-code:text-accent-700 dark:prose-code:text-accent-300',
              'prose-code:bg-neutral-200 dark:prose-code:bg-neutral-800',
              'prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
              'prose-pre:bg-neutral-900 prose-pre:text-neutral-0',
              'prose-pre:border prose-pre:border-neutral-800'
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <CodeBlock
                        language={match[1]}
                        value={String(children).replace(/\n$/, '')}
                      />
                    ) : (
                      <code
                        className={cn(className, 'text-xs md:text-sm')}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Actions - Show on hover (desktop only) with glow */}
          {!isMobile && (
            <div
              className={cn(
                'absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity',
                isUser ? 'right-0' : 'left-0'
              )}
            >
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-neutral-0 dark:text-neutral-900 rounded-full text-xs font-medium flex items-center gap-1.5 hover:scale-105 hover:shadow-glow-accent-sm transition-all shadow-md"
                aria-label="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MessageCard.displayName = 'MessageCard';

export default MessageCard;
