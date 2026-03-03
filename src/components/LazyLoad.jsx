import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LazyLoad wrapper component
 * Shows loading spinner while lazy-loaded component loads
 */
const LoadingFallback = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-accent-500 animate-spin mx-auto mb-3" />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
    </div>
  </div>
);

/**
 * LazyLoad HOC
 * Wraps lazy-loaded components with Suspense and fallback
 */
export const withLazyLoad = (LazyComponent, fallbackMessage) => {
  return (props) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LoadingFallback;
