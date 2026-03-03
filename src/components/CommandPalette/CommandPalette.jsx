import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommandPalette } from '../../hooks/useCommandPalette';
import { useConversation } from '../../context/ConversationContext';
import { useSettings } from '../../context/SettingsContext';
import CommandItem from './CommandItem';
import getCommands from './CommandGroups';
import { scaleIn } from '../../design-system/motion';

const CommandPalette = ({ onOpenSettings, onToggleTheme, currentTheme, onExport }) => {
  const { isOpen, closePalette, addRecentCommand } = useCommandPalette();
  const {
    conversations,
    createConversation,
    loadConversation,
    deleteConversation,
    activeConversationId,
    searchConversations,
  } = useConversation();

  const [search, setSearch] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closePalette();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closePalette]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = (command) => {
    // Execute command action
    if (command.action) {
      command.action();
    }

    // Handle model switching
    if (command.provider && command.model) {
      // This would be implemented in the settings context
      console.log('Switch model:', command.provider, command.model);
    }

    // Add to recent commands
    addRecentCommand(command);

    // Close palette
    closePalette();
  };

  const handleDeleteConversation = () => {
    if (activeConversationId) {
      deleteConversation(activeConversationId);
    }
  };

  const commands = getCommands({
    createConversation,
    loadConversation,
    deleteConversation: handleDeleteConversation,
    conversations,
    openSettings: onOpenSettings,
    toggleTheme: onToggleTheme,
    currentTheme,
    exportConversation: onExport,
    searchConversations,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={closePalette}
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] pointer-events-none">
            <motion.div
              {...scaleIn}
              className="pointer-events-auto w-full max-w-2xl mx-4"
            >
              <Command.Dialog
                open={isOpen}
                onOpenChange={closePalette}
                className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden"
                label="Global Command Menu"
              >
                <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4">
                  <svg
                    className="w-5 h-5 text-neutral-400 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Type a command or search..."
                    className="w-full py-4 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
                  />
                </div>

                <Command.List className="max-h-96 overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-neutral-500">
                    No results found.
                  </Command.Empty>

                  {commands.map((group) => (
                    group.commands.length > 0 && (
                      <Command.Group
                        key={group.group}
                        heading={group.group}
                        className="mb-2 last:mb-0"
                      >
                        <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                          {group.group}
                        </div>
                        {group.commands.map((command) => (
                          <CommandItem
                            key={command.id}
                            command={command}
                            onSelect={handleSelect}
                          />
                        ))}
                      </Command.Group>
                    )
                  ))}
                </Command.List>

                <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">Esc</kbd>
                      Close
                    </span>
                  </div>
                </div>
              </Command.Dialog>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
