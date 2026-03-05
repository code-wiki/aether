import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Copy, Check, AlertCircle, CheckCircle2, ExternalLink, LogIn } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getAuthInstructions, testAuthConnection } from '../../services/gcp/authStatus';
import { startGUIAuthentication, waitForCredentials, checkGCloudAvailable } from '../../services/gcp/oauth';

/**
 * GCPAuthModal - Modal for handling expired Google Cloud authentication
 * Shows when ADC credentials are missing or expired
 */
function GCPAuthModal({ isOpen, onClose, onAuthSuccess, authStatus }) {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(null);
  const [gcloudAvailable, setGcloudAvailable] = useState(null);

  const instructions = getAuthInstructions();

  // Check if gcloud is available when modal opens
  React.useEffect(() => {
    if (isOpen) {
      checkGCloudAvailable().then(result => {
        setGcloudAvailable(result.available);
      });
    }
  }, [isOpen]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTestAuth = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await testAuthConnection();
      setTestResult(result);

      if (result.success) {
        // Wait a moment to show success, then close
        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to test authentication'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleGUIAuthentication = async () => {
    setAuthenticating(true);
    setAuthProgress('Opening browser for authentication...');
    setTestResult(null);

    try {
      // Start the OAuth flow
      const authResult = await startGUIAuthentication();

      if (!authResult.success) {
        setTestResult({
          success: false,
          message: authResult.error || 'Failed to start authentication'
        });
        setAuthenticating(false);
        return;
      }

      setAuthProgress('Waiting for you to complete authentication in your browser...');

      // Wait for credentials to be saved
      const waitResult = await waitForCredentials(120000); // 2 minute timeout

      if (waitResult.success) {
        setAuthProgress('Authentication successful! Verifying...');

        // Test the connection
        const testResult = await testAuthConnection();

        if (testResult.success) {
          setTestResult({
            success: true,
            message: 'Successfully authenticated with Google Cloud!'
          });

          // Close modal after brief delay
          setTimeout(() => {
            onAuthSuccess?.();
            onClose();
          }, 1500);
        } else {
          setTestResult({
            success: false,
            message: 'Authentication completed but verification failed. Please try again.'
          });
        }
      } else if (waitResult.timeout) {
        setTestResult({
          success: false,
          message: 'Authentication timeout. Please complete the process in your browser and click "I\'ve Authenticated".'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Failed to detect credentials. Please try again or use terminal method.'
        });
      }

    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Authentication failed'
      });
    } finally {
      setAuthenticating(false);
      setAuthProgress(null);
    }
  };

  const openTerminal = () => {
    // Open terminal with the auth command pre-filled (platform-specific)
    if (window.electron.isMac) {
      // macOS - open Terminal.app
      window.electron.shell.exec(`osascript -e 'tell application "Terminal" to do script "gcloud auth application-default login"'`);
    } else if (window.electron.isWindows) {
      // Windows - open cmd
      window.electron.shell.exec('start cmd.exe /K "gcloud auth application-default login"');
    } else {
      // Linux - try to open default terminal
      window.electron.shell.exec('x-terminal-emulator -e "gcloud auth application-default login" || gnome-terminal -- bash -c "gcloud auth application-default login; exec bash"');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {instructions.title}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {authStatus?.message || 'Your credentials need to be refreshed'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* GUI Authentication Button - Primary Method */}
              {gcloudAvailable && (
                <div className="p-4 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <LogIn className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-pink-900 dark:text-pink-100">
                        Authenticate with Google (Recommended)
                      </p>
                      <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">
                        Click the button below to sign in with your Google account. Your browser will open automatically.
                      </p>
                      <button
                        onClick={handleGUIAuthentication}
                        disabled={authenticating || testing}
                        className={cn(
                          'mt-3 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2 shadow-lg',
                          (authenticating || testing) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {authenticating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            Sign in with Google
                          </>
                        )}
                      </button>
                      {authProgress && (
                        <p className="text-sm text-pink-600 dark:text-pink-400 mt-2 flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                          {authProgress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* gcloud CLI not available warning */}
              {gcloudAvailable === false && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        gcloud CLI not installed
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        To use GUI authentication, please install the Google Cloud SDK first.
                      </p>
                      <a
                        href="https://cloud.google.com/sdk/docs/install"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
                      >
                        Download Google Cloud SDK
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                    Or use terminal method
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                {instructions.steps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full font-semibold text-sm">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {step.description}
                      </p>
                      {step.command && (
                        <div className="mt-2 flex items-center gap-2">
                          <code className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-mono text-sm text-neutral-900 dark:text-neutral-100">
                            {step.command}
                          </code>
                          <button
                            onClick={() => handleCopy(step.command)}
                            className={cn(
                              'p-3 rounded-lg transition-all',
                              copied
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                            )}
                            title={copied ? 'Copied!' : 'Copy command'}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Action: Open Terminal */}
              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-purple-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <Terminal className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-pink-900 dark:text-pink-100">
                      Quick Action
                    </p>
                    <p className="text-sm text-purple-700 dark:text-pink-300 mt-1">
                      Click the button below to open your terminal with the command ready to run.
                    </p>
                    <button
                      onClick={openTerminal}
                      className="mt-3 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <Terminal className="w-4 h-4" />
                      Open Terminal & Authenticate
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {instructions.alternativeTitle}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {instructions.alternative}
                </p>
                <a
                  href="https://cloud.google.com/iam/docs/service-accounts-create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-pink-600 dark:text-pink-400 hover:underline"
                >
                  Learn about service accounts
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Test Result */}
              <AnimatePresence>
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      'p-4 rounded-xl border',
                      testResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {testResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <p className={cn(
                          'font-medium',
                          testResult.success
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                        )}>
                          {testResult.success ? 'Authentication Successful!' : 'Authentication Failed'}
                        </p>
                        <p className={cn(
                          'text-sm mt-1',
                          testResult.success
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        )}>
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <button
                onClick={onClose}
                className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTestAuth}
                disabled={testing}
                className={cn(
                  'px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2',
                  testing && 'opacity-50 cursor-not-allowed'
                )}
              >
                {testing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    I've Authenticated
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default GCPAuthModal;
