import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Terminal, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { detectADC, checkGCloudInstalled, getSetupInstructions } from '../../services/gcp/auth';
import { startGUIAuthentication, waitForCredentials } from '../../services/gcp/oauth';
import { testAuthConnection } from '../../services/gcp/authStatus';
import { cn } from '../../lib/utils';

/**
 * SetupWizard - Guides users through GCP setup on first launch
 * Ensures users can chat immediately without friction
 */
function SetupWizard({ onComplete }) {
  const { settings, updateGCPConfig } = useSettings();
  const [step, setStep] = useState('checking');
  const [gcloudInstalled, setGcloudInstalled] = useState(false);
  const [adcStatus, setAdcStatus] = useState(null);
  const [setupInstructions, setSetupInstructions] = useState([]);
  const [isChecking, setIsChecking] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(null);
  const [copied, setCopied] = useState(false);

  // Check setup status on mount
  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    setIsChecking(true);

    try {
      // Check if gcloud is installed
      const gcloudCheck = await checkGCloudInstalled();
      setGcloudInstalled(gcloudCheck.installed);

      if (!gcloudCheck.installed) {
        setStep('needs-gcloud');
        setSetupInstructions(getSetupInstructions());
        setIsChecking(false);
        return;
      }

      // Check if ADC is configured
      const adcCheck = await detectADC();
      setAdcStatus(adcCheck);

      if (!adcCheck.success) {
        setStep('needs-auth');
        setIsChecking(false);
        return;
      }

      // Check if project ID is set
      if (!adcCheck.projectId) {
        setStep('needs-project');
        setIsChecking(false);
        return;
      }

      // All good! Auto-configure and continue
      await updateGCPConfig({
        projectId: adcCheck.projectId,
      });

      setStep('ready');
      setIsChecking(false);

      // Auto-close after 1 second
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('[SetupWizard] Check failed:', error);
      setStep('needs-gcloud');
      setSetupInstructions(getSetupInstructions());
      setIsChecking(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleRetry = () => {
    setIsChecking(true);
    checkSetupStatus();
  };

  const handleGUIAuthentication = async () => {
    setAuthenticating(true);
    setAuthProgress('Opening browser for authentication...');

    try {
      // Start the OAuth flow
      const authResult = await startGUIAuthentication();

      if (!authResult.success) {
        setAuthProgress('Failed to start authentication. Please try terminal method.');
        setTimeout(() => setAuthProgress(null), 3000);
        setAuthenticating(false);
        return;
      }

      setAuthProgress('Complete sign-in in your browser...');

      // Wait for credentials to be saved
      const waitResult = await waitForCredentials(120000); // 2 minute timeout

      if (waitResult.success) {
        setAuthProgress('Verifying credentials...');

        // Test the connection
        const testResult = await testAuthConnection();

        if (testResult.success) {
          setAuthProgress('Successfully authenticated!');

          // Re-check setup status to continue
          setTimeout(() => {
            setAuthProgress(null);
            setAuthenticating(false);
            checkSetupStatus();
          }, 1000);
        } else {
          setAuthProgress('Verification failed. Please try again.');
          setTimeout(() => setAuthProgress(null), 3000);
          setAuthenticating(false);
        }
      } else if (waitResult.timeout) {
        setAuthProgress('Authentication timeout. Please complete sign-in and click "Check Again".');
        setTimeout(() => setAuthProgress(null), 3000);
        setAuthenticating(false);
      } else {
        setAuthProgress('Failed to detect credentials. Please try again.');
        setTimeout(() => setAuthProgress(null), 3000);
        setAuthenticating(false);
      }

    } catch (error) {
      setAuthProgress('Authentication failed. Please try again.');
      setTimeout(() => setAuthProgress(null), 3000);
      setAuthenticating(false);
    }
  };

  const handleCopyCommand = (command) => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openTerminal = () => {
    const platform = window.electron?.platform;
    if (platform === 'darwin') {
      window.electron.shell.exec(`osascript -e 'tell application "Terminal" to do script "gcloud auth application-default login"'`);
    } else if (platform === 'win32') {
      window.electron.shell.exec('start cmd.exe /K "gcloud auth application-default login"');
    } else {
      window.electron.shell.exec('x-terminal-emulator -e "gcloud auth application-default login" || gnome-terminal -- bash -c "gcloud auth application-default login; exec bash"');
    }
  };

  // Render states... (content continues)
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Setting up Aether...</h2>
            <p className="text-text-secondary">Checking your GCP credentials</p>
            <div className="mt-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'ready') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">All Set!</h2>
            <p className="text-text-secondary">
              GCP credentials detected. Ready to chat!
            </p>
            {adcStatus?.projectId && (
              <p className="text-sm text-accent mt-2">
                Project: {adcStatus.projectId}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center z-50 p-2 sm:p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-900 rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-5 max-w-xl w-full border border-neutral-200 dark:border-neutral-800"
      >
        <div className="text-center mb-3 sm:mb-4">
          <div className="text-3xl sm:text-4xl mb-2">
            {step === 'needs-gcloud' && '📦'}
            {step === 'needs-auth' && '🔐'}
            {step === 'needs-project' && '🎯'}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {step === 'needs-gcloud' && 'Install Google Cloud SDK'}
            {step === 'needs-auth' && "Let's Get Started"}
            {step === 'needs-project' && 'Set GCP Project ID'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            {step === 'needs-gcloud' && 'Aether needs gcloud CLI'}
            {step === 'needs-auth' && 'Authenticate with Google Cloud'}
            {step === 'needs-project' && 'Specify your GCP project'}
          </p>
        </div>

        {step === 'needs-auth' && (
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            {/* Quick Setup - GUI Authentication */}
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                <h3 className="text-sm sm:text-base font-semibold text-pink-900 dark:text-pink-100">
                  Quick Setup
                </h3>
              </div>

              <button
                onClick={handleGUIAuthentication}
                disabled={authenticating}
                className={cn(
                  'w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg',
                  authenticating && 'opacity-50 cursor-not-allowed'
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-2 bg-white dark:bg-neutral-900 rounded-lg border border-pink-200 dark:border-pink-800"
                >
                  <p className="text-xs text-pink-600 dark:text-pink-400 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                    {authProgress}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                  Or terminal
                </span>
              </div>
            </div>

            {/* Manual Setup - Terminal - Collapsed */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                <code className="text-green-400 font-mono text-xs flex-1 truncate">
                  gcloud auth application-default login
                </code>
                <button
                  onClick={() => handleCopyCommand('gcloud auth application-default login')}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                  title={copied ? 'Copied!' : 'Copy'}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-neutral-400" />
                  )}
                </button>
              </div>

              <button
                onClick={openTerminal}
                className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Open Terminal
              </button>
            </div>
          </div>
        )}

        {step === 'needs-gcloud' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100 mb-1">
                  Google Cloud SDK Required
                </h3>
                <a
                  href="https://cloud.google.com/sdk/docs/install"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-medium transition-colors"
                >
                  Download SDK
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="flex-1 py-2 px-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 transition-colors font-medium"
          >
            Skip
          </button>
          <button
            onClick={handleRetry}
            disabled={authenticating}
            className={cn(
              'flex-1 py-2 px-3 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs sm:text-sm transition-colors font-medium',
              authenticating && 'opacity-50 cursor-not-allowed'
            )}
          >
            I've Authenticated
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default SetupWizard;
