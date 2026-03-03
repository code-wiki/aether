import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { detectADC, checkGCloudInstalled, getSetupInstructions } from '../../services/gcp/auth';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">
            {step === 'needs-gcloud' && '📦'}
            {step === 'needs-auth' && '🔐'}
            {step === 'needs-project' && '🎯'}
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {step === 'needs-gcloud' && 'Install Google Cloud SDK'}
            {step === 'needs-auth' && 'Authenticate with Google Cloud'}
            {step === 'needs-project' && 'Set GCP Project ID'}
          </h2>
          <p className="text-text-secondary">
            {step === 'needs-gcloud' && 'Aether needs gcloud CLI to connect with Google Cloud AI'}
            {step === 'needs-auth' && 'Sign in to access Gemini and Claude models'}
            {step === 'needs-project' && 'Specify which GCP project to use'}
          </p>
        </div>

        {step === 'needs-auth' && (
          <div className="bg-surface rounded-lg p-6 mb-6">
            <div className="bg-black text-green-400 p-3 rounded font-mono text-sm mb-4">
              gcloud auth application-default login
            </div>
            <p className="text-sm text-text-secondary">
              Run this command, sign in with Google, then click "Check Again"
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-4 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-elevated transition-colors font-medium"
          >
            Skip for Now
          </button>
          <button
            onClick={handleRetry}
            className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium"
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupWizard;
