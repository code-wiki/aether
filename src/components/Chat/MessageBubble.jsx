import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import CodeBlock from './CodeBlock';
import { cn } from '../../lib/utils';

/**
 * MessageBubble - Linear.app inspired message component
 * Features:
 * - Responsive widths (mobile → desktop)
 * - Refined spacing and shadows
 * - Markdown rendering with code blocks
 * - Clean, minimal design
 * - Perfect typography
 */
function MessageBubble({ message, isMobile }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div
        className={cn(
          'rounded-lg transition-all',
          // Responsive max-width
          'max-w-[90%] md:max-w-[85%] lg:max-w-[80%]',
          // Responsive padding
          isMobile ? 'px-3 py-2' : 'px-4 py-3',
          // User message styling
          isUser && 'bg-accent-500 text-white shadow-sm',
          // AI message styling - Linear.app inspired subtle background
          !isUser && 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800'
        )}
      >
        {isUser ? (
          <p className={cn(
            'whitespace-pre-wrap',
            isMobile ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'
          )}>
            {message.content}
          </p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            className={cn(
              'prose dark:prose-invert max-w-none',
              isMobile ? 'prose-sm' : 'prose-sm',
              // Linear-style prose refinements
              'prose-headings:font-semibold prose-headings:tracking-tight',
              'prose-p:text-neutral-700 dark:prose-p:text-neutral-300',
              'prose-a:text-accent-600 dark:prose-a:text-accent-400 prose-a:no-underline hover:prose-a:underline',
              'prose-code:text-accent-700 dark:prose-code:text-accent-300 prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
              'prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800'
            )}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <CodeBlock
                    language={match[1]}
                    value={String(children).replace(/\n$/, '')}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
