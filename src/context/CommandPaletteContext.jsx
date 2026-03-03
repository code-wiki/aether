import React, { createContext, useContext, useState, useCallback } from 'react';

const CommandPaletteContext = createContext(null);

export const CommandPaletteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recentCommands, setRecentCommands] = useState([]);

  const openPalette = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setSearch('');
  }, []);

  const togglePalette = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const addRecentCommand = useCallback((command) => {
    setRecentCommands((prev) => {
      // Remove duplicates and add to start
      const filtered = prev.filter((cmd) => cmd.id !== command.id);
      return [command, ...filtered].slice(0, 5); // Keep last 5
    });
  }, []);

  const value = {
    isOpen,
    search,
    recentCommands,
    openPalette,
    closePalette,
    togglePalette,
    setSearch,
    addRecentCommand,
  };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
};

export default CommandPaletteContext;
