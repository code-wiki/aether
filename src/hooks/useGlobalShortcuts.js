import { useEffect, useCallback } from 'react';

/**
 * Global keyboard shortcuts hook
 * Registers keyboard shortcuts that work app-wide
 */
export const useGlobalShortcuts = (shortcuts) => {
  const handleKeyDown = useCallback((event) => {
    // Build key combination string
    const keys = [];
    if (event.metaKey || event.ctrlKey) keys.push('mod'); // Cmd on Mac, Ctrl on Windows
    if (event.shiftKey) keys.push('shift');
    if (event.altKey) keys.push('alt');

    // Normalize key name
    const key = event.key.toLowerCase();
    if (!['meta', 'control', 'shift', 'alt'].includes(key)) {
      keys.push(key);
    }

    const combination = keys.join('+');

    // Check if this combination has a handler
    if (shortcuts[combination]) {
      event.preventDefault();
      shortcuts[combination](event);
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Parse keyboard shortcut string to display format
 * Example: "mod+k" -> "⌘K" on Mac, "Ctrl+K" on Windows
 */
export const formatShortcut = (shortcut) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return shortcut
    .split('+')
    .map((key) => {
      switch (key.toLowerCase()) {
        case 'mod':
          return isMac ? '⌘' : 'Ctrl';
        case 'shift':
          return isMac ? '⇧' : 'Shift';
        case 'alt':
          return isMac ? '⌥' : 'Alt';
        case 'enter':
          return '↵';
        case 'escape':
          return 'Esc';
        case 'backspace':
          return '⌫';
        case 'delete':
          return '⌦';
        default:
          return key.toUpperCase();
      }
    })
    .join('');
};

export default useGlobalShortcuts;
