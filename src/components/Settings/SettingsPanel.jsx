import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import PersonaManager from './PersonaManager';
import UsageTracker from './UsageTracker';
import ImportExport from './ImportExport';

function SettingsPanel({ onClose }) {
  const {
    settings,
    updateApiKey,
    updateGCPConfig,
    availableLocations,
    discoveryLoading,
    refreshLocations
  } = useSettings();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('api')}
              className={`
                pb-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'api'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('personas')}
              className={`
                pb-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'personas'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              Personas
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`
                pb-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'usage'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              Usage
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`
                pb-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'data'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              Data
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`
                pb-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'about'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              About
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'api' && (
            <div className="space-y-6">
              {/* API Keys Section */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">API Keys</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={settings.apiKeys.openai}
                      onChange={(e) => updateApiKey('openai', e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* GCP Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">GCP Configuration</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Project ID
                    </label>
                    <input
                      type="text"
                      value={settings.gcp.projectId}
                      onChange={(e) => updateGCPConfig({ projectId: e.target.value })}
                      placeholder="your-project-id"
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Location
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={settings.gcp.location}
                        onChange={(e) => updateGCPConfig({ location: e.target.value })}
                        disabled={discoveryLoading}
                        className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {availableLocations.length === 0 ? (
                          <option disabled>Loading locations...</option>
                        ) : (
                          availableLocations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                              {loc.flag} {loc.name}
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        onClick={refreshLocations}
                        disabled={discoveryLoading}
                        className="px-3 py-2 bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh locations"
                      >
                        {discoveryLoading ? '⏳' : '🔄'}
                      </button>
                    </div>
                    {discoveryLoading && (
                      <p className="text-xs text-text-secondary mt-1">
                        Fetching available locations...
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Service Account Path
                    </label>
                    <input
                      type="text"
                      value={settings.gcp.serviceAccountPath}
                      onChange={(e) => updateGCPConfig({ serviceAccountPath: e.target.value })}
                      placeholder="/path/to/service-account.json"
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary outline-none focus:border-accent"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Path to your GCP service account JSON file
                    </p>
                  </div>
                </div>
              </div>

              {/* Theme Info */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Theme</h3>
                <p className="text-sm text-text-secondary">
                  Current theme: <span className="font-medium">{theme === 'light' ? 'Light' : 'Dark'}</span>
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Use the moon/sun icon in the sidebar to toggle
                </p>
              </div>
            </div>
          )}

          {activeTab === 'personas' && (
            <PersonaManager />
          )}

          {activeTab === 'usage' && (
            <UsageTracker />
          )}

          {activeTab === 'data' && (
            <ImportExport />
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">Aether</h3>
                <p className="text-text-secondary mb-4">Next-generation AI chatbot</p>
                <div className="text-sm text-text-secondary">Version 1.0.0</div>
              </div>

              <div className="p-4 bg-surface rounded-lg border border-border">
                <h4 className="font-semibold text-text-primary mb-2">Features</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>✓ Multi-provider AI support (Gemini, Claude, OpenAI)</li>
                  <li>✓ Local-first storage with IndexedDB</li>
                  <li>✓ Full-text conversation search</li>
                  <li>✓ Export to multiple formats</li>
                  <li>✓ Custom personas and system prompts</li>
                  <li>✓ File attachment support</li>
                  <li>✓ Beautiful light and dark themes</li>
                </ul>
              </div>

              <div className="p-4 bg-surface rounded-lg border border-border">
                <h4 className="font-semibold text-text-primary mb-2">Tech Stack</h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Electron 28.2.0</li>
                  <li>• React 18.2.0</li>
                  <li>• Vite 5.1.0</li>
                  <li>• TailwindCSS 3.4.1</li>
                  <li>• IndexedDB for storage</li>
                </ul>
              </div>

              <div className="text-center text-xs text-text-secondary">
                Built with ❤️ using Electron + React
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
