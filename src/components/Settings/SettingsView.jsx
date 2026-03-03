import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Cloud, Users, BarChart3, Database } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import GCPSettings from './GCPSettings';
import PersonaManager from './PersonaManager';
import UsageTracker from './UsageTracker';
import ImportExport from './ImportExport';
import { Button, Input, Card } from '../../design-system/primitives';
import { fadeIn, slideInRight } from '../../design-system/motion';

/**
 * SettingsView - Full-screen settings interface
 * Features:
 * - Accessible via Cmd+, and Cmd+K
 * - Tabs: API Keys, GCP, Personas, Usage, Data
 * - Keyboard navigation (Tab, arrows)
 * - Escape to close
 * - Smooth transitions
 */
const SettingsView = ({ onClose }) => {
  const { settings, updateApiKey } = useSettings();
  const [activeTab, setActiveTab] = useState('gcp'); // Start with GCP tab
  const [apiKeys, setApiKeys] = useState({
    openai: settings.apiKeys?.openai || '',
  });

  const tabs = [
    { id: 'gcp', label: 'Google Cloud', icon: Cloud },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'personas', label: 'Personas', icon: Users },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'data', label: 'Data', icon: Database },
  ];

  const handleSaveApiKey = async (provider) => {
    await updateApiKey(provider, apiKeys[provider]);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 bg-neutral-0 dark:bg-neutral-1000 flex"
      >
        {/* Sidebar Navigation */}
        <div className="w-64 bg-neutral-0 dark:bg-neutral-1000 border-r border-neutral-200 dark:border-neutral-800 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-0">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          {/* Tab Navigation */}
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === id
                    ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Keyboard Hint */}
          <div className="mt-8 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Press <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded font-mono">Esc</kbd> to close
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                {...slideInRight}
                className="space-y-6"
              >
                {/* GCP Tab */}
                {activeTab === 'gcp' && (
                  <div>
                    <GCPSettings />
                  </div>
                )}

                {/* API Keys Tab */}
                {activeTab === 'api' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-0 mb-2">
                        API Keys
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Configure API keys for OpenAI models (optional)
                      </p>
                    </div>

                    {/* OpenAI API Key */}
                    <Card variant="default" padding="md">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            OpenAI API Key
                          </label>
                          <Input
                            type="password"
                            value={apiKeys.openai}
                            onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                            placeholder="sk-..."
                            className="font-mono"
                          />
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Required for GPT-4o and GPT-4o-mini models
                          </p>
                        </div>

                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleSaveApiKey('openai')}
                          disabled={!apiKeys.openai || apiKeys.openai === settings.apiKeys?.openai}
                        >
                          Save OpenAI Key
                        </Button>
                      </div>
                    </Card>

                    {/* Help */}
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        <strong>Note:</strong> GCP models (Gemini, Claude) use Application Default Credentials.
                        Configure those in the Google Cloud tab.
                      </p>
                    </div>
                  </div>
                )}

                {/* Personas Tab */}
                {activeTab === 'personas' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-0 mb-2">
                        Personas
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Create custom AI personalities with system prompts
                      </p>
                    </div>
                    <PersonaManager />
                  </div>
                )}

                {/* Usage Tab */}
                {activeTab === 'usage' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-0 mb-2">
                        Usage Statistics
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Track your AI model usage
                      </p>
                    </div>
                    <UsageTracker />
                  </div>
                )}

                {/* Data Tab */}
                {activeTab === 'data' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-0 mb-2">
                        Data Management
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Export and manage your conversation data
                      </p>
                    </div>
                    <ImportExport />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsView;
