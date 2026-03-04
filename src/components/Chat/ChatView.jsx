import React from 'react';
import { motion } from 'framer-motion';
import { useConversation } from '../../context/ConversationContext';
import { MessageSquare, Sparkles } from 'lucide-react';
import MessageStream from './MessageStream';
import ComposerBar from './ComposerBar';
import ModelSelector from './ModelSelector';
import ExportMenu from './ExportMenu';
import PersonaSelector from './PersonaSelector';
import { fadeIn } from '../../design-system/motion';
import { Badge } from '../../design-system/primitives';
import { cn } from '../../lib/utils';

/**
 * ChatView - Enhanced responsive chat interface
 * Features:
 * - Responsive layout (mobile → desktop)
 * - Minimal chrome, content-focused design
 * - Virtual scrolling for performance
 * - Smooth spring animations
 * - Rich composer with slash commands
 * - Linear.app inspired minimal design
 */
const ChatView = ({ isMobile, isTablet }) => {
  const { activeConversation, messages, isStreaming } = useConversation();

  // Empty state - no active conversation
  if (!activeConversation) {
    return (
      <motion.div
        {...fadeIn}
        className="flex-1 flex items-center justify-center bg-neutral-0 dark:bg-neutral-1000"
      >
        <div className="text-center max-w-md mx-auto px-4 md:px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mb-6 md:mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-3xl rounded-full" />
              <div className="relative p-6 md:p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-purple-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-purple-900/20 rounded-2xl md:rounded-3xl">
                <MessageSquare className={cn(
                  "text-pink-500",
                  isMobile ? "w-14 h-14" : "w-20 h-20"
                )} strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-0 mb-2 md:mb-3"
          >
            Welcome to Aether
          </motion.h2>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-600 dark:text-neutral-400 mb-4 md:mb-6 text-base md:text-lg"
          >
            Your AI workspace for powerful conversations
          </motion.p>

          {!isMobile && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2 text-sm text-neutral-500 dark:text-neutral-500"
            >
              <div className="flex items-center justify-center gap-2">
                <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono border border-neutral-200 dark:border-neutral-700">
                  ⌘K
                </kbd>
                <span>Command palette</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono border border-neutral-200 dark:border-neutral-700">
                  ⌘N
                </kbd>
                <span>New conversation</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-neutral-0 dark:bg-neutral-1000 relative overflow-hidden" role="main" aria-label="Chat conversation">
      {/* Header - Minimal design with glassmorphism, responsive */}
      <div className={cn(
        "border-b border-neutral-200/50 dark:border-neutral-800/50",
        "flex items-center justify-between backdrop-blur-xl",
        "bg-neutral-0/80 dark:bg-neutral-1000/80 sticky top-0 z-10 shadow-sm",
        "px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3"
      )}>
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <Sparkles className={cn(
            "text-pink-500 flex-shrink-0",
            isMobile ? "w-4 h-4" : "w-5 h-5"
          )} />
          <div className="flex-1 min-w-0">
            <h2 className={cn(
              "font-semibold text-neutral-900 dark:text-neutral-0 truncate",
              isMobile ? "text-sm" : "text-base"
            )}>
              {activeConversation.title}
            </h2>
            {!isMobile && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{messages.length} messages</span>
                {isStreaming && (
                  <>
                    <span>•</span>
                    <Badge variant="primary" size="sm" className="animate-pulse">
                      Streaming
                    </Badge>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions - Hide some on mobile */}
        <div className="flex items-center gap-1 md:gap-2">
          {!isMobile && <PersonaSelector />}
          {!isMobile && <ExportMenu conversation={activeConversation} />}
          <ModelSelector isMobile={isMobile} />
        </div>
      </div>

      {/* Messages - Virtual scrolling, responsive padding */}
      <MessageStream
        messages={messages}
        isStreaming={isStreaming}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Composer - Rich input, responsive */}
      <ComposerBar isMobile={isMobile} isTablet={isTablet} />
    </div>
  );
};

export default ChatView;
