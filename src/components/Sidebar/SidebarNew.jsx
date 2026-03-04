import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Settings, Plus, Search, Filter, X, ChevronLeft, MessageSquare, Workflow } from 'lucide-react';
import { useConversation } from '../../context/ConversationContext';
import { useTheme } from '../../context/ThemeContext';
import ConversationCard from './ConversationCard';
import { Button, Input } from '../../design-system/primitives';
import { staggerContainer, staggerItem } from '../../design-system/motion';
import { cn } from '../../lib/utils';

/**
 * SidebarNew - Responsive sidebar with mobile drawer support
 * Features:
 * - Mobile drawer (full-screen overlay with backdrop)
 * - Desktop persistent sidebar
 * - Keyboard navigation (arrow keys, Enter)
 * - Quick filters (All, Today, Pinned)
 * - Search conversations
 * - Virtual scrolling ready
 * - Smooth animations
 * - Linear.app inspired design
 */
const SidebarNew = ({ isOpen, isMobile, onClose, onSettingsClick, onWorkflowClick }) => {
  const [activeView, setActiveView] = useState('chat'); // 'chat' | 'workflows'
  const {
    conversations,
    activeConversationId,
    createConversation,
    loadConversation,
    deleteConversation,
    searchConversations,
  } = useConversation();

  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all | today | pinned
  const [filteredConversations, setFilteredConversations] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  // Filter conversations
  useEffect(() => {
    let filtered = conversations;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter
    if (activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((conv) => new Date(conv.updatedAt) >= today);
    } else if (activeFilter === 'pinned') {
      filtered = filtered.filter((conv) => conv.pinned);
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, activeFilter]);

  const displayConversations = filteredConversations || conversations;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!listRef.current) return;

      const count = displayConversations.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % count);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + count) % count);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (displayConversations[selectedIndex]) {
          loadConversation(displayConversations[selectedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayConversations, selectedIndex, loadConversation]);

  const handlePinConversation = (conversationId) => {
    // TODO: Implement pin functionality in ConversationContext
    console.log('Pin conversation:', conversationId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Animation variants for drawer
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={isMobile ? 'closed' : 'open'}
          animate="open"
          exit={isMobile ? 'closed' : 'open'}
          variants={sidebarVariants}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className={cn(
            'h-full bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col',
            // Mobile: Fixed overlay drawer
            isMobile && 'fixed inset-y-0 left-0 z-50 w-[280px]',
            // Desktop: Relative sidebar
            !isMobile && 'relative w-72 lg:w-80'
          )}
          role="navigation"
          aria-label="Conversations sidebar"
        >
          {/* Header - Extra top padding on desktop for macOS traffic lights */}
          <div className="p-3 md:p-4 md:pt-10 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h1 className="text-lg md:text-xl font-semibold bg-clip-text ">
                aether
              </h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="p-3 min-w-[44px] min-h-[44px] rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 flex items-center justify-center"
                  title="Toggle theme"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                {isMobile && (
                  <button
                    onClick={onClose}
                    className="p-3 min-w-[44px] min-h-[44px] rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 flex items-center justify-center"
                    aria-label="Close sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-3 md:mb-4 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <button
                onClick={() => setActiveView('chat')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium',
                  activeView === 'chat'
                    ? 'bg-white dark:bg-neutral-700 text-accent-600 dark:text-accent-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                )}
                aria-label="Chat view"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('workflows');
                  if (onWorkflowClick) {
                    onWorkflowClick();
                    if (isMobile) onClose();
                  }
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium',
                  activeView === 'workflows'
                    ? 'bg-white dark:bg-neutral-700 text-accent-600 dark:text-accent-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                )}
                aria-label="Workflows view"
              >
                <Workflow className="w-4 h-4" />
                <span>Agents</span>
              </button>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                createConversation();
                if (isMobile) onClose();
              }}
              icon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              New Chat
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="p-3 md:p-4 space-y-2 md:space-y-3 border-b border-neutral-200 dark:border-neutral-800">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                icon={<Search className="w-4 h-4" />}
                className="pr-8"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3 text-neutral-500" />
                </button>
              )}
            </div>

            {/* Quick Filters - Enhanced with glow on active */}
            <div className="flex gap-1.5 md:gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'flex-1 px-2 md:px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  activeFilter === 'all'
                    ? 'bg-accent-500 text-white shadow-glow-accent-sm'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                )}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('today')}
                className={cn(
                  'flex-1 px-2 md:px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  activeFilter === 'today'
                    ? 'bg-accent-500 text-white shadow-glow-accent-sm'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                )}
              >
                Today
              </button>
              <button
                onClick={() => setActiveFilter('pinned')}
                className={cn(
                  'flex-1 px-2 md:px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  activeFilter === 'pinned'
                    ? 'bg-accent-500 text-white shadow-glow-accent-sm'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                )}
              >
                Pinned
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 md:p-3">
            {displayConversations.length === 0 ? (
              <div className="text-center text-neutral-500 dark:text-neutral-400 text-sm mt-8">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-1.5 md:space-y-2"
              >
                {displayConversations.map((conv, index) => (
                  <motion.div key={conv.id} variants={staggerItem}>
                    <ConversationCard
                      conversation={conv}
                      isActive={conv.id === activeConversationId}
                      onClick={() => {
                        loadConversation(conv.id);
                        if (isMobile) onClose();
                      }}
                      onDelete={deleteConversation}
                      onPin={handlePinConversation}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 md:p-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              variant="secondary"
              size="md"
              onClick={onSettingsClick}
              icon={<Settings className="w-4 h-4" />}
              className="w-full"
            >
              Settings
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default SidebarNew;
