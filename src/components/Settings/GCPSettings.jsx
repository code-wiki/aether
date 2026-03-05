import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
  Info,
  LogIn,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { detectADC, checkGCloudInstalled, getSetupInstructions, GCP_LOCATIONS } from '../../services/gcp/auth';
import { startGUIAuthentication, waitForCredentials } from '../../services/gcp/oauth';
import { testAuthConnection } from '../../services/gcp/authStatus';
import { Button, Input, Badge, Card } from '../../design-system/primitives';
import { fadeInUp } from '../../design-system/motion';

/**
 * GCPSettings - Auto-detect GCP credentials UI
 * Features:
 * - Auto-detect Application Default Credentials
 * - Show ADC status (connected/not found)
 * - One-click copy setup commands
 * - Location selector
 * - Re-check button
 * - Clear error messages with fix instructions
 */
const GCPSettings = () => {
  const { settings, updateGCPConfig } = useSettings();
  const [status, setStatus] = useState('idle'); // idle | detecting | success | error
  const [adcInfo, setAdcInfo] = useState(null);
  const [gcloudInstalled, setGcloudInstalled] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(null);

  // Auto-detect on mount
  useEffect(() => {
    detectCredentials();
    checkGCloud();
  }, []);

  const checkGCloud = async () => {
    const result = await checkGCloudInstalled();
    setGcloudInstalled(result);
  };

  const detectCredentials = async () => {
    setStatus('detecting');
    setError(null);

    try {
      const result = await detectADC();

      if (result.success) {
        setStatus('success');
        setAdcInfo(result);

        // Update settings with detected project ID
        await updateGCPConfig({
          projectId: result.projectId,
        });
      } else {
        setStatus('error');
        setError(result);
      }
    } catch (err) {
      setStatus('error');
      setError({
        error: err.message,
        instructions: 'Run: gcloud auth application-default login',
      });
    }
  };

  const handleLocationChange = async (locationId) => {
    await updateGCPConfig({ location: locationId });
  };

  const handleCopyCommand = (command) => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGUIAuthentication = async () => {
    setAuthenticating(true);
    setAuthProgress('Opening browser for authentication...');
    setError(null);

    try {
      // Start the OAuth flow
      const authResult = await startGUIAuthentication();

      if (!authResult.success) {
        setError({
          error: authResult.error || 'Failed to start authentication',
          instructions: 'Please make sure gcloud CLI is installed and try again',
        });
        setAuthenticating(false);
        setAuthProgress(null);
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
          // Re-detect credentials to update UI
          await detectCredentials();
          setAuthProgress('Successfully authenticated!');

          // Clear progress after delay
          setTimeout(() => {
            setAuthProgress(null);
          }, 3000);
        } else {
          setError({
            error: 'Authentication completed but verification failed',
            instructions: 'Please try again or check your credentials',
          });
          setStatus('error');
        }
      } else if (waitResult.timeout) {
        setError({
          error: 'Authentication timeout',
          instructions: 'Please complete the process in your browser and click "Re-check"',
        });
        setStatus('error');
      } else {
        setError({
          error: 'Failed to detect credentials',
          instructions: 'Please try again or use the terminal method',
        });
        setStatus('error');
      }

    } catch (error) {
      setError({
        error: error.message || 'Authentication failed',
        instructions: 'Please try again or use the terminal method',
      });
      setStatus('error');
    } finally {
      setAuthenticating(false);
      setAuthProgress(null);
    }
  };

  const setupInstructions = getSetupInstructions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-0 mb-2">
          Google Cloud Platform
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Connect to GCP Vertex AI for Gemini and Claude models using Application Default Credentials
        </p>
      </div>

      {/* Status Card */}
      <Card variant="default" padding="md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {status === 'detecting' && (
              <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            {status === 'idle' && (
              <Info className="w-6 h-6 text-neutral-400" />
            )}

            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-0">
                {status === 'detecting' && 'Detecting credentials...'}
                {status === 'success' && 'Credentials detected'}
                {status === 'error' && 'Credentials not found'}
                {status === 'idle' && 'ADC Status'}
              </h4>
              {adcInfo && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {adcInfo.credentialType === 'authorized_user' ? 'User account' : 'Service account'}
                  {adcInfo.clientEmail && ` • ${adcInfo.clientEmail}`}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={detectCredentials}
            disabled={status === 'detecting'}
            icon={<RefreshCw className={`w-4 h-4 ${status === 'detecting' ? 'animate-spin' : ''}`} />}
          >
            Re-check
          </Button>
        </div>

        {/* Success: Show detected info */}
        {status === 'success' && adcInfo && (
          <AnimatePresence>
            <motion.div {...fadeInUp} className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Application Default Credentials detected
                      {adcInfo.autoConfigured && ' (auto-configured)'}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {adcInfo.credentialsPath}
                    </p>
                    {adcInfo.autoConfigured && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✨ Project ID was automatically imported from gcloud config
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Project ID */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Project ID
                </label>
                <Input
                  type="text"
                  value={adcInfo.projectId}
                  disabled
                  className="font-mono text-sm"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Auto-detected from credentials
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Error: Show instructions and GUI auth button */}
        {status === 'error' && error && (
          <AnimatePresence>
            <motion.div {...fadeInUp} className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      {error.error}
                    </p>
                    {error.instructions && !error.instructions.startsWith('Please') && (
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-xs bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded font-mono text-red-900 dark:text-red-100 flex-1">
                          {error.instructions}
                        </code>
                        <button
                          onClick={() => handleCopyCommand(error.instructions.replace('Run: ', ''))}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
                          aria-label="Copy command"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* GUI Authentication Button */}
              {gcloudInstalled?.installed && (
                <div className="p-3 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="flex items-start gap-2">
                    <LogIn className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-pink-900 dark:text-pink-100">
                        Authenticate with Google
                      </p>
                      <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">
                        Sign in with your Google account to authenticate
                      </p>
                      <button
                        onClick={handleGUIAuthentication}
                        disabled={authenticating}
                        className="mt-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white rounded-lg font-medium text-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {authenticating ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-3 h-3" />
                            Sign in with Google
                          </>
                        )}
                      </button>
                      {authProgress && (
                        <p className="text-xs text-pink-600 dark:text-pink-400 mt-2 flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                          {authProgress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </Card>

      {/* Location Selector */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Region
        </label>
        <select
          value={settings.gcp.location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        >
          {GCP_LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.flag} {loc.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Choose a region closest to you for lower latency
        </p>
      </div>

      {/* gcloud CLI Status */}
      {gcloudInstalled !== null && (
        <Card variant="default" padding="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                gcloud CLI
              </span>
              {gcloudInstalled.installed ? (
                <Badge variant="success" size="sm">
                  Installed {gcloudInstalled.version && `(${gcloudInstalled.version})`}
                </Badge>
              ) : (
                <Badge variant="error" size="sm">
                  Not installed
                </Badge>
              )}
            </div>
            {!gcloudInstalled.installed && (
              <a
                href="https://cloud.google.com/sdk/docs/install"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-500 hover:text-accent-600 flex items-center gap-1"
              >
                Install
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Setup Instructions (collapsed by default) */}
      {status === 'error' && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-accent-500 dark:hover:text-accent-400">
            Show setup instructions
          </summary>
          <Card variant="default" padding="md" className="mt-3">
            <pre className="text-xs text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-wrap">
              {setupInstructions.join('\n')}
            </pre>
          </Card>
        </details>
      )}

      {/* Help Link */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <Info className="w-4 h-4" />
        <span>
          Need help?{' '}
          <a
            href="https://cloud.google.com/docs/authentication/application-default-credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-500 hover:text-accent-600 underline"
          >
            Learn about Application Default Credentials
          </a>
        </span>
      </div>
    </div>
  );
};

export default GCPSettings;
