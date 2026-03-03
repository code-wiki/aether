import React, { useState } from 'react';
import { useConversation } from '../../context/ConversationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAI } from '../../hooks/useAI';

function ModelSelector() {
  const { activeConversation, conversations, setConversations } = useConversation();
  const { settings } = useSettings();
  const { getModels } = useAI();
  const [showDropdown, setShowDropdown] = useState(false);

  const currentProvider = activeConversation?.provider || settings.defaultProvider || 'gemini';
  const currentModel = activeConversation?.model || settings.defaultModel[currentProvider];

  const providers = [
    { id: 'claude', name: 'Claude', icon: '🧠' },
    { id: 'gemini', name: 'Gemini', icon: '✨' },
    { id: 'openai', name: 'OpenAI', icon: '🤖' },
  ];

  const handleProviderChange = (providerId) => {
    if (!activeConversation) return;

    // Update conversation provider and model
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          provider: providerId,
          model: settings.defaultModel[providerId],
        };
      }
      return conv;
    }));
  };

  const handleModelChange = (modelId) => {
    if (!activeConversation) return;

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          model: modelId,
        };
      }
      return conv;
    }));
    setShowDropdown(false);
  };

  const models = getModels(currentProvider);
  const currentModelInfo = models.find(m => m.id === currentModel);

  // Check if Claude is unavailable in current region
  const isClaudeUnavailable = currentProvider === 'claude' &&
    !['us-east5', 'europe-west1', 'asia-southeast1'].includes(settings.gcp.location);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-2 bg-surface hover:bg-surface-elevated border border-border rounded-lg text-sm font-medium text-text-primary transition-colors flex items-center gap-2"
      >
        <span>{providers.find(p => p.id === currentProvider)?.icon}</span>
        <span>{currentModelInfo?.name || currentModel}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl backdrop-blur-sm z-20 overflow-hidden">
            {/* Provider Selection */}
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider">Provider</div>
              <div className="flex gap-2">
                {providers.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    className={`
                      flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${currentProvider === provider.id
                        ? 'bg-accent-500 text-white shadow-md'
                        : 'bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700'
                      }
                    `}
                  >
                    <div>{provider.icon}</div>
                    <div className="text-xs mt-1">{provider.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div className="p-3">
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider">Model</div>

              {/* Claude Region Warning */}
              {isClaudeUnavailable && (
                <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <div>
                      <div className="font-medium">Claude models unavailable</div>
                      <div className="mt-1">
                        Claude is only available in us-east5, europe-west1, and asia-southeast1.
                        Please change your location in Settings.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {models.length === 0 ? (
                  <div className="text-sm text-text-secondary text-center py-4">
                    {isClaudeUnavailable
                      ? 'No models available in this region'
                      : 'Loading models...'}
                  </div>
                ) : (
                  models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-all border
                      ${currentModel === model.id
                        ? 'bg-accent-500 text-white border-accent-600 shadow-sm'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
                      }
                    `}
                  >
                    <div className="text-sm font-medium">{model.name}</div>
                    <div className={`text-xs mt-1 ${currentModel === model.id ? 'text-white opacity-80' : 'text-text-secondary'}`}>
                      {model.description}
                    </div>
                  </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ModelSelector;
