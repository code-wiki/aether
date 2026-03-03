import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarNew from './Sidebar/SidebarNew';
import ChatView from './Chat/ChatView';
import StatusBar from './StatusBar/StatusBar';
import CommandPalette from './CommandPalette/CommandPalette';
import LoadingFallback from './LazyLoad';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { useConversation } from '../context/ConversationContext';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import useGlobalShortcuts from '../hooks/useGlobalShortcuts';
import { slideInLeft } from '../design-system/motion';

// Lazy load Settings (only loaded when opened)
const SettingsView = lazy(() => import('./Settings/SettingsView'));

/**
 * AppShell - Main application layout
 * Features:
 * - Responsive layout (mobile → desktop)
 * - Collapsible sidebar (Cmd+B)
 * - Mobile drawer navigation
 * - Command palette integration (Cmd+K)
 * - Global keyboard shortcuts
 * - Settings panel
 * - Linear.app inspired minimal chrome design
 */
const AppShell = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { togglePalette } = useCommandPalette();
  const { createConversation } = useConversation();
  const { toggleTheme, theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Auto-manage sidebar state based on screen size
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true); // Always show on desktop
    } else {
      setSidebarOpen(false); // Hidden by default on mobile/tablet
    }
  }, [isDesktop]);

  // Global keyboard shortcuts
  const shortcuts = {
    'mod+k': (e) => {
      e.preventDefault();
      togglePalette();
    },
    'mod+n': (e) => {
      e.preventDefault();
      createConversation();
    },
    'mod+b': (e) => {
      e.preventDefault();
      setSidebarOpen((prev) => !prev);
    },
    'mod+,': (e) => {
      e.preventDefault();
      setShowSettings(true);
    },
    'mod+shift+t': (e) => {
      e.preventDefault();
      toggleTheme();
    },
    'escape': () => {
      if (showSettings) {
        setShowSettings(false);
      } else if (!isDesktop && sidebarOpen) {
        // Close sidebar on mobile when pressing escape
        setSidebarOpen(false);
      }
    },
  };

  useGlobalShortcuts(shortcuts);

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleExport = () => {
    // Export functionality will be implemented
    console.log('Export conversation');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Command Palette */}
      <CommandPalette
        onOpenSettings={handleOpenSettings}
        onToggleTheme={toggleTheme}
        currentTheme={theme}
        onExport={handleExport}
      />

      {/* Sidebar - Drawer on mobile/tablet, persistent on desktop */}
      <SidebarNew
        isOpen={sidebarOpen}
        isMobile={isMobile || isTablet}
        onClose={() => setSidebarOpen(false)}
        onSettingsClick={handleOpenSettings}
      />

      {/* Backdrop for mobile drawer */}
      <AnimatePresence>
        {(isMobile || isTablet) && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area - Proper width constraints to prevent sidebar collapse */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Toggle sidebar button when closed on desktop, or hamburger on mobile */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 md:top-4 md:left-4 z-10 p-2 bg-surface hover:bg-surface-hover rounded-md border border-neutral-200 dark:border-neutral-800 transition-colors shadow-sm"
            aria-label="Open sidebar"
          >
            <svg
              className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        <ChatView isMobile={isMobile} isTablet={isTablet} />
        {!isMobile && <StatusBar />}
      </div>

      {/* Settings View (Full-screen, lazy loaded) */}
      {showSettings && (
        <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
          <SettingsView onClose={() => setShowSettings(false)} isMobile={isMobile} />
        </Suspense>
      )}
    </div>
  );
};

export default AppShell;
