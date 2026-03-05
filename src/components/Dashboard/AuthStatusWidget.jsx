import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, LogIn, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { checkAuthStatus, testAuthConnection } from '../../services/gcp/authStatus';
import { startGUIAuthentication, waitForCredentials } from '../../services/gcp/oauth';
import { useSettings } from '../../context/SettingsContext';

/**
 * AuthStatusWidget - Shows GCP authentication status on dashboard
 * Provides quick access to re-authenticate when needed
 */
function AuthStatusWidget() {
  const { settings } = useSettings();
  const [authStatus, setAuthStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(null);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setChecking(true);
    try {
      const status = await checkAuthStatus();
      setAuthStatus(status);
    } catch (error) {
      console.error('[AuthWidget] Error checking auth:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleReAuthenticate = async () => {
    setAuthenticating(true);
    setAuthProgress('Opening browser...');

    try {
      const authResult = await startGUIAuthentication();

      if (!authResult.success) {
        setAuthProgress('Failed to start authentication');
        setTimeout(() => setAuthProgress(null), 3000);
        return;
      }

      setAuthProgress('Complete sign-in in your browser...');

      const waitResult = await waitForCredentials(120000);

      if (waitResult.success) {
        setAuthProgress('Verifying...');
        const testResult = await testAuthConnection();

        if (testResult.success) {
          setAuthProgress('Successfully authenticated!');
          await checkAuth();
          setTimeout(() => setAuthProgress(null), 2000);
        } else {
          setAuthProgress('Verification failed');
          setTimeout(() => setAuthProgress(null), 3000);
        }
      } else {
        setAuthProgress('Authentication timeout');
        setTimeout(() => setAuthProgress(null), 3000);
      }
    } catch (error) {
      setAuthProgress('Authentication failed');
      setTimeout(() => setAuthProgress(null), 3000);
    } finally {
      setAuthenticating(false);
    }
  };

  // Don't show if no GCP configured
  if (!settings.gcp?.projectId) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Status Icon */}
          {checking ? (
            <RefreshCw className="w-5 h-5 text-neutral-400 animate-spin mt-0.5" />
          ) : authStatus?.valid ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          )}

          {/* Status Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {checking ? 'Checking authentication...' : authStatus?.valid ? 'Authenticated' : 'Authentication Required'}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              {authStatus?.message || 'Verifying credentials...'}
            </p>
            {authProgress && (
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-1 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                {authProgress}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!authStatus?.valid && !checking && (
            <button
              onClick={handleReAuthenticate}
              disabled={authenticating}
              className={cn(
                'px-3 py-1.5 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                authenticating && 'opacity-50 cursor-not-allowed'
              )}
            >
              {authenticating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign In</span>
                </>
              )}
            </button>
          )}
          {authStatus?.valid && (
            <button
              onClick={checkAuth}
              disabled={checking}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              title="Re-check authentication"
            >
              <RefreshCw className={cn('w-4 h-4 text-neutral-600 dark:text-neutral-400', checking && 'animate-spin')} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AuthStatusWidget;
