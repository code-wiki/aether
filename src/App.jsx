import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ConversationProvider } from './context/ConversationContext';
import { AttachmentProvider } from './context/AttachmentContext';
import { AgentProvider } from './context/AgentContext';
import { CommandPaletteProvider } from './context/CommandPaletteContext';
import AppShell from './components/AppShell';
import SetupWizard from './components/Onboarding/SetupWizard';
import WelcomeScreen from './components/Welcome/WelcomeScreen';
import GCPAuthModal from './components/Auth/GCPAuthModal';
import ErrorBoundary from './components/UI/ErrorBoundary';
import { ToastContainer } from './components/UI/Toast';
import { useToast } from './hooks/useToast';
import { checkAuthStatus } from './services/gcp/authStatus';

function AppContent() {
  const { toasts, removeToast } = useToast();
  const { settings, isLoading } = useSettings();
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeCompleted, setWelcomeCompleted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);

  // Check if user has completed welcome on mount
  useEffect(() => {
    const hasCompletedWelcome = localStorage.getItem('aether:welcomeCompleted');
    if (hasCompletedWelcome === 'true') {
      setShowWelcome(false);
      setWelcomeCompleted(true);
    }
  }, []);

  // Check if setup is needed on first load
  useEffect(() => {
    if (!isLoading && !setupChecked && welcomeCompleted) {
      // Show wizard if GCP is not configured
      const needsSetup = !settings.gcp?.projectId;
      setShowSetupWizard(needsSetup);
      setSetupChecked(true);
    }
  }, [isLoading, setupChecked, welcomeCompleted, settings.gcp?.projectId]);

  // Check GCP auth status after setup is complete
  useEffect(() => {
    const checkAuth = async () => {
      // Only check if setup is complete and we have a project ID
      if (!setupChecked || !settings.gcp?.projectId || showSetupWizard) {
        return;
      }

      try {
        const status = await checkAuthStatus();
        setAuthStatus(status);

        // Show modal if auth is invalid or expired
        if (!status.valid) {
          console.log('[App] Auth check failed:', status.message);
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('[App] Error checking auth status:', error);
      }
    };

    // Check on mount
    checkAuth();

    // Re-check every 30 minutes
    const interval = setInterval(checkAuth, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [setupChecked, settings.gcp?.projectId, showSetupWizard]);

  // Show welcome screen on first launch
  if (showWelcome && !welcomeCompleted) {
    return (
      <>
        <WelcomeScreen
          onContinue={() => {
            setShowWelcome(false);
            setWelcomeCompleted(true);
          }}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  // Show loading while checking
  if (isLoading || !setupChecked) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-0 dark:bg-neutral-1000">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading Aether...</p>
        </div>
      </div>
    );
  }

  // Show setup wizard if needed
  if (showSetupWizard) {
    return (
      <>
        <SetupWizard onComplete={() => setShowSetupWizard(false)} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  // Normal app
  return (
    <>
      <AppShell />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* GCP Auth Modal - shows when credentials expire */}
      <GCPAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={async () => {
          // Re-check auth status after successful authentication
          const status = await checkAuthStatus();
          setAuthStatus(status);
        }}
        authStatus={authStatus}
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <ConversationProvider>
            <AttachmentProvider>
              <AgentProvider>
                <CommandPaletteProvider>
                  <AppContent />
                </CommandPaletteProvider>
              </AgentProvider>
            </AttachmentProvider>
          </ConversationProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
