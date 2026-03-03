import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ConversationProvider } from './context/ConversationContext';
import { CommandPaletteProvider } from './context/CommandPaletteContext';
import AppShell from './components/AppShell';
import SetupWizard from './components/Onboarding/SetupWizard';
import ErrorBoundary from './components/UI/ErrorBoundary';
import { ToastContainer } from './components/UI/Toast';
import { useToast } from './hooks/useToast';

function AppContent() {
  const { toasts, removeToast } = useToast();
  const { settings, isLoading } = useSettings();
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);

  // Check if setup is needed on first load
  useEffect(() => {
    if (!isLoading && !setupChecked) {
      // Show wizard if GCP is not configured
      const needsSetup = !settings.gcp?.projectId;
      setShowSetupWizard(needsSetup);
      setSetupChecked(true);
    }
  }, [isLoading, setupChecked, settings.gcp?.projectId]);

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
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <ConversationProvider>
            <CommandPaletteProvider>
              <AppContent />
            </CommandPaletteProvider>
          </ConversationProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
