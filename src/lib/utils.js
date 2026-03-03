import clsx from 'clsx';

/**
 * Utility function to merge class names
 * Uses clsx for conditional class logic
 * @param {...any} inputs - Class names to merge
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
  return clsx(inputs);
}
