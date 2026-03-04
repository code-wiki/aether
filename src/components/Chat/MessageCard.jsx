import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { User, Bot, Sparkles } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';
import CodeBlock from './CodeBlock';
import AttachmentPreview from './AttachmentPreview';
import ThinkingIndicator from './ThinkingIndicator';
import MessageActions from './MessageActions';
import QuickReplies from './QuickReplies';
import { Badge } from '../../design-system/primitives';
import { hoverLift } from '../../design-system/motion';
import { cn } from '../../lib/utils';
import { useConversation } from '../../context/ConversationContext';

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
  const { toolExecutionStatus, messages } = useConversation();
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Generate smart suggestions for assistant messages
  const suggestions = isLatest && isAssistant && !isStreaming && message.content
    ? generateSuggestions(message.content)
    : [];

  const handleCopy = async (msg) => {
    // Copy is handled internally by MessageActions component
  };

  const handleEdit = (msg) => {
    // Dispatch edit event for ComposerBar to handle
    const event = new CustomEvent('editMessage', { detail: { message: msg } });
    window.dispatchEvent(event);
  };

  const handleRegenerate = async (msg) => {
    // Dispatch regenerate event
    const event = new CustomEvent('regenerateMessage', { detail: { message: msg } });
    window.dispatchEvent(event);
  };

  const handleBranch = (msg) => {
    // Dispatch branch event
    const event = new CustomEvent('branchConversation', { detail: { message: msg } });
    window.dispatchEvent(event);
  };

  const handleFeedback = (msgId, feedback) => {
    // Save feedback via localStorage or future backend
    console.log('Feedback saved:', msgId, feedback);
    // Dispatch feedback event
    const event = new CustomEvent('messageFeedback', { detail: { messageId: msgId, feedback } });
    window.dispatchEvent(event);
  };

  const handleQuickReply = (suggestion) => {
    // Dispatch quick reply event for ComposerBar
    const event = new CustomEvent('quickReply', { detail: { text: suggestion } });
    window.dispatchEvent(event);
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
    <>
      <MessageContent
        message={message}
        isLatest={isLatest}
        isStreaming={isStreaming}
        isMobile={isMobile}
        isUser={isUser}
        isAssistant={isAssistant}
        toolExecutionStatus={toolExecutionStatus}
        formatTimestamp={formatTimestamp}
        handleCopy={handleCopy}
        handleEdit={handleEdit}
        handleRegenerate={handleRegenerate}
        handleBranch={handleBranch}
        handleFeedback={handleFeedback}
      />

      {/* Quick Replies - Show after assistant's latest message */}
      {suggestions.length > 0 && (
        <QuickReplies
          suggestions={suggestions}
          onSelect={handleQuickReply}
          isMobile={isMobile}
        />
      )}
    </>
  );
});

// Helper function to generate smart suggestions
function generateSuggestions(content) {
  const suggestions = [];

  // Analyze content and generate contextual suggestions
  if (content.toLowerCase().includes('code') || content.includes('```')) {
    suggestions.push('Can you explain how this works?');
    suggestions.push('Can you add comments to the code?');
  }

  if (content.toLowerCase().includes('error') || content.toLowerCase().includes('fix')) {
    suggestions.push('How can I debug this?');
    suggestions.push('What are common causes?');
  }

  if (content.toLowerCase().includes('install') || content.toLowerCase().includes('setup')) {
    suggestions.push('What are the next steps?');
    suggestions.push('Are there any prerequisites?');
  }

  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push('Tell me more about this');
    suggestions.push('Can you give an example?');
    suggestions.push('What are the alternatives?');
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

// Separate component for message content
const MessageContent = memo(({
  message,
  isLatest,
  isStreaming,
  isMobile,
  isUser,
  isAssistant,
  toolExecutionStatus,
  formatTimestamp,
  handleCopy,
  handleEdit,
  handleRegenerate,
  handleBranch,
  handleFeedback
}) => {

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
              ? 'bg-blue-500 text-white'
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
            isUser && 'bg-blue-500 text-white rounded-tr-sm shadow-blue-500/10',
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
            <>
              {/* Show thinking indicator if message is empty and streaming, or if tool is executing */}
              {isLatest && (isStreaming || toolExecutionStatus) && !message.content ? (
                <ThinkingIndicator
                  type={toolExecutionStatus ? 'tool' : 'thinking'}
                  tool={toolExecutionStatus?.tool}
                  isMobile={isMobile}
                />
              ) : message.content ? (
                <div className={cn(
                  'prose dark:prose-invert max-w-none break-words',
                  isMobile ? 'prose-sm' : 'prose-sm',
                  // Linear-style prose
                  'prose-headings:font-semibold prose-headings:tracking-tight',
                  'prose-p:text-neutral-700 dark:prose-p:text-neutral-300',
                  'prose-a:text-blue-600 dark:prose-a:text-blue-400',
                  'prose-code:text-blue-700 dark:prose-code:text-blue-300',
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

                        // Extract text content from children (handle arrays, objects, and strings)
                        const getTextContent = (child) => {
                          if (typeof child === 'string') return child;
                          if (Array.isArray(child)) return child.map(getTextContent).join('');
                          if (child && typeof child === 'object' && child.props) {
                            return getTextContent(child.props.children);
                          }
                          return '';
                        };

                        return !inline && match ? (
                          <CodeBlock
                            language={match[1]}
                            value={getTextContent(children).replace(/\n$/, '')}
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
              ) : null}

              {/* Show tool execution status below content if tool is running and message has content */}
              {isLatest && toolExecutionStatus && message.content && (
                <div className="mt-2">
                  <ThinkingIndicator
                    type="tool"
                    tool={toolExecutionStatus.tool}
                    isMobile={isMobile}
                  />
                </div>
              )}
            </>
          )}

          {/* Attachments Display */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn('mt-3 flex flex-wrap gap-2', isMobile && 'mt-2')}>
              {message.attachments.map((attachment, index) => (
                <AttachmentPreview
                  key={attachment.id || index}
                  file={attachment}
                  onRemove={null} // No remove button for sent messages
                />
              ))}
            </div>
          )}


          {/* Message Actions */}
          <MessageActions
            message={message}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
            onBranch={handleBranch}
            onFeedback={handleFeedback}
            isUser={isUser}
            isMobile={isMobile}
          />
        </div>
      </div>
    </motion.div>
  );
});

MessageCard.displayName = 'MessageCard';
MessageContent.displayName = 'MessageContent';

export default MessageCard;
