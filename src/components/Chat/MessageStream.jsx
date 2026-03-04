import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Hand } from 'lucide-react';
import MessageCard from './MessageCard';
import { fadeInUp, staggerContainer, staggerItem } from '../../design-system/motion';
import { cn } from '../../lib/utils';

/**
 * MessageStream - Responsive virtual scrolling message list
 *
 * Note: For initial implementation, we're using a standard scrolling approach
 * with optimizations. Virtual scrolling with react-window will be added
 * when we have 1000+ messages to handle.
 *
 * Features:
 * - Responsive padding (mobile → desktop)
 * - Auto-scroll to bottom on new messages
 * - Smooth animations with Framer Motion
 * - Optimized re-renders with React.memo on MessageCard
 * - Linear.app inspired spacing
 *
 * Future: Implement VariableSizeList from react-window for 10k+ messages
 */
const MessageStream = ({ messages, isStreaming, isMobile, isTablet }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  };

  // Scroll to bottom on new messages or when streaming
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isStreaming]);

  // Initial scroll (instant, not smooth)
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  // Detect if user has scrolled up (disable auto-scroll)
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShouldAutoScroll(isNearBottom);
  };

  // Empty state - responsive
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 md:px-6">
        <motion.div
          {...fadeInUp}
          className="text-center max-w-md"
        >
          <div className="mb-3 md:mb-4 flex justify-center">
            <div className={cn(
              "bg-neutral-100 dark:bg-neutral-800 rounded-xl md:rounded-2xl",
              isMobile ? "p-3" : "p-4"
            )}>
              <Hand className={cn(
                "text-neutral-400",
                isMobile ? "w-10 h-10" : "w-12 h-12"
              )} />
            </div>
          </div>
          <h3 className={cn(
            "font-semibold text-neutral-900 dark:text-neutral-0 mb-2",
            isMobile ? "text-base" : "text-lg"
          )}>
            Start the conversation
          </h3>
          <p className={cn(
            "text-neutral-600 dark:text-neutral-400",
            isMobile ? "text-sm" : "text-base"
          )}>
            Send a message below to begin chatting with AI
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        "flex-1 overflow-y-auto scroll-smooth",
        // Responsive padding
        "px-3 py-4 md:px-4 md:py-5 lg:px-6 lg:py-6"
      )}
    >
      <div className="max-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className={cn(
            isMobile ? "space-y-3" : "space-y-4 md:space-y-6"
          )}
        >
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              variants={staggerItem}
              layout
            >
              <MessageCard
                message={message}
                isLatest={index === messages.length - 1}
                isStreaming={isStreaming && index === messages.length - 1}
                isMobile={isMobile}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Scroll to bottom button (when user scrolls up) - responsive */}
      {!shouldAutoScroll && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShouldAutoScroll(true);
            scrollToBottom();
          }}
          className={cn(
            "fixed bg-pink-500/20 dark:bg-pink-500/30 backdrop-blur-sm text-pink-600 dark:text-pink-400",
            "border border-pink-300 dark:border-purple-600",
            "rounded-lg shadow-lg hover:bg-pink-500/30 dark:hover:bg-pink-500/40 hover:scale-105 transition-all",
            isMobile
              ? "bottom-24 right-4 p-2.5"
              : "bottom-36 right-6 md:right-8 p-3"
          )}
          aria-label="Scroll to bottom"
        >
          <svg className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      )}
    </div>
  );
};

export default MessageStream;
