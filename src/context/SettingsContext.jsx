import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { detectADC } from '../services/gcp/auth';
import { validateClaudeModels, validateGeminiModels, clearValidationCache } from '../services/gcp/modelValidator';
import { FALLBACK_LOCATIONS, FALLBACK_OPENAI_MODELS, KNOWN_CLAUDE_MODELS } from '../services/gcp/modelRegistry';

const SettingsContext = createContext();

const defaultSettings = {
  apiKeys: {
    openai: '',
    gemini: '',
    claude: '',
  },
  gcp: {
    projectId: '',
    location: 'us-east5', // Default Claude region
    serviceAccountPath: '',
  },
  defaultProvider: 'claude',
  defaultModel: {
    gemini: 'gemini-1.5-flash',
    claude: 'claude-sonnet-4-5@20250929',
    openai: 'gpt-4o-mini',
  },
  personas: [
    {
      id: 'default',
      name: 'Default Assistant',
      systemPrompt: 'You are a helpful AI assistant.',
      icon: '🤖',
    },
  ],
  selectedPersona: 'default',
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [availableLocations] = useState(FALLBACK_LOCATIONS);
  const [availableModels, setAvailableModels] = useState({
    gemini: [],
    claude: [],
    openai: FALLBACK_OPENAI_MODELS, // Static for OpenAI
  });
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const prevLocationRef = useRef(null);

  /**
   * Validate and refresh available models
   */
  const refreshModels = async (projectId, location) => {
    if (!projectId || !location) {
      console.warn('[Settings] Cannot validate models without project ID and location');
      return;
    }

    setDiscoveryLoading(true);
    try {
      console.log(`[Settings] Validating models for ${location}...`);

      // Validate models in parallel
      const [claudeModels, geminiModels] = await Promise.all([
        validateClaudeModels(projectId, location),
        validateGeminiModels(projectId, location),
      ]);

      setAvailableModels({
        claude: claudeModels,
        gemini: geminiModels,
        openai: FALLBACK_OPENAI_MODELS,
      });

      console.log(`[Settings] Validation complete: ${claudeModels.length} Claude, ${geminiModels.length} Gemini`);

      // If no models found, show fallback (user needs to enable models in Model Garden)
      if (claudeModels.length === 0 && geminiModels.length === 0) {
        console.warn('[Settings] No models available. Models may need to be enabled in Model Garden.');
      }
    } catch (error) {
      console.error('[Settings] Model validation failed:', error);
      // On error, use known models as fallback
      setAvailableModels({
        claude: KNOWN_CLAUDE_MODELS,
        gemini: [],
        openai: FALLBACK_OPENAI_MODELS,
      });
    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Initialize settings on mount
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        let loadedSettings = defaultSettings;

        // Load saved settings
        if (window.electron) {
          const savedSettings = await window.electron.settings.get();
          if (Object.keys(savedSettings).length > 0) {
            loadedSettings = { ...defaultSettings, ...savedSettings };
          }
        }

        // Auto-detect GCP credentials if not configured
        if (!loadedSettings.gcp.projectId) {
          try {
            const adcResult = await detectADC();
            if (adcResult.success && adcResult.projectId) {
              loadedSettings = {
                ...loadedSettings,
                gcp: {
                  ...loadedSettings.gcp,
                  projectId: adcResult.projectId,
                  location: 'us-east5', // Force Claude region
                },
              };

              console.log(`✨ Auto-configured GCP: ${adcResult.projectId} @ us-east5`);

              if (window.electron) {
                await window.electron.settings.update(loadedSettings);
              }
            }
          } catch (err) {
            console.log('GCP auto-detection skipped:', err.message);
          }
        }

        setSettings(loadedSettings);

        // Validate models on startup if GCP is configured
        if (loadedSettings.gcp.projectId) {
          await refreshModels(loadedSettings.gcp.projectId, loadedSettings.gcp.location);
        }

        console.log('[Settings] Initialized successfully');
      } catch (error) {
        console.error('[Settings] Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, []);

  // Watch for location changes and re-validate models
  useEffect(() => {
    // Skip if still loading or no project ID
    if (isLoading || !settings.gcp.projectId) {
      return;
    }

    // Only refresh if location actually changed
    if (prevLocationRef.current && prevLocationRef.current !== settings.gcp.location) {
      console.log(`[Settings] Location changed: ${prevLocationRef.current} → ${settings.gcp.location}`);
      clearValidationCache();
      refreshModels(settings.gcp.projectId, settings.gcp.location);
    }

    // Update ref
    prevLocationRef.current = settings.gcp.location;
  }, [settings.gcp.location, settings.gcp.projectId, isLoading]);

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (window.electron) {
      await window.electron.settings.update(updated);
    }
  };

  const updateApiKey = async (provider, key) => {
    const updated = {
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [provider]: key,
      },
    };
    setSettings(updated);

    if (window.electron) {
      await window.electron.settings.update(updated);
    }
  };

  const updateGCPConfig = async (config) => {
    const updated = {
      ...settings,
      gcp: {
        ...settings.gcp,
        ...config,
      },
    };
    setSettings(updated);

    if (window.electron) {
      await window.electron.settings.update(updated);
    }
  };

  // Manual refresh for UI button
  const refreshLocations = async () => {
    console.log('[Settings] Locations are static (FALLBACK_LOCATIONS)');
  };

  const manualRefreshModels = async () => {
    if (!settings.gcp.projectId || !settings.gcp.location) {
      console.warn('[Settings] Cannot refresh models without GCP configuration');
      return;
    }
    clearValidationCache();
    await refreshModels(settings.gcp.projectId, settings.gcp.location);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateApiKey,
        updateGCPConfig,
        isLoading,
        availableLocations,
        availableModels,
        refreshLocations,
        refreshModels: manualRefreshModels,
        discoveryLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
