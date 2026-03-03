import { useCallback, useRef } from 'react';

/**
 * useStreamingOptimization - Optimize streaming response rendering
 *
 * Features:
 * - Debounced rendering (batches rapid updates)
 * - Optimistic UI updates (instant feedback)
 * - 60fps performance target
 *
 * Usage:
 * const optimizedUpdate = useStreamingOptimization(updateCallback);
 * optimizedUpdate(chunk); // Batched and debounced
 */
export const useStreamingOptimization = (updateCallback, delay = 50) => {
  const bufferRef = useRef('');
  const timeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const rafRef = useRef(null);

  const flush = useCallback(() => {
    if (bufferRef.current && updateCallback) {
      updateCallback(bufferRef.current);
      bufferRef.current = '';
      lastUpdateRef.current = Date.now();
    }
  }, [updateCallback]);

  const optimizedUpdate = useCallback((chunk) => {
    // Accumulate chunks in buffer
    bufferRef.current += chunk;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel existing RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame for 60fps rendering
    rafRef.current = requestAnimationFrame(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      // If enough time has passed, update immediately
      if (timeSinceLastUpdate >= delay) {
        flush();
      } else {
        // Otherwise, schedule update for later
        timeoutRef.current = setTimeout(flush, delay - timeSinceLastUpdate);
      }
    });
  }, [flush, delay]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    // Flush any remaining content
    flush();
  }, [flush]);

  return { optimizedUpdate, flush, cleanup };
};

/**
 * Debounce function for general use
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for general use
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default useStreamingOptimization;
