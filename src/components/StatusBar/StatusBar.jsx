import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Sparkles, Keyboard } from 'lucide-react';
import { useConversation } from '../../context/ConversationContext';
import { Badge } from '../../design-system/primitives';

/**
 * StatusBar - Bottom status indicator
 * Features:
 * - Connection status
 * - Active model display
 * - Message count
 * - Keyboard shortcuts hint
 * - Subtle glassmorphism effect
 */
const StatusBar = () => {
  const { activeConversation, messages, isStreaming } = useConversation();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!activeConversation) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-6 py-2 border-t border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-sm"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
        {/* Left side - Connection & Model */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Active Model */}
          {activeConversation && (
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              <span className="font-medium">
                {activeConversation.model || 'gemini-1.5-flash'}
              </span>
              {isStreaming && (
                <Badge variant="primary" size="sm" className="animate-pulse ml-1">
                  Streaming
                </Badge>
              )}
            </div>
          )}

          {/* Message Count */}
          <div className="flex items-center gap-1.5">
            <span>{messages.length} messages</span>
          </div>
        </div>

        {/* Right side - Keyboard Hints */}
        <div className="flex items-center gap-3">
          <Keyboard className="w-3.5 h-3.5" />
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded font-mono text-[10px]">
              ⌘K
            </kbd>
            <span className="text-[10px]">Commands</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusBar;
