import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

function PersonaSelector() {
  const { settings, updateSettings } = useSettings();
  const [showMenu, setShowMenu] = useState(false);

  const personas = settings.personas || [];
  const selectedPersona = personas.find(p => p.id === settings.selectedPersona) || personas[0];

  const handleSelectPersona = (personaId) => {
    updateSettings({ selectedPersona: personaId });
    setShowMenu(false);
  };

  if (personas.length <= 1) {
    return null; // Don't show if only default persona
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-3 py-1.5 bg-surface hover:bg-surface-elevated border border-border rounded-lg text-sm font-medium text-text-primary transition-colors flex items-center gap-2"
        title="Select persona"
      >
        <span>{selectedPersona?.icon || '🤖'}</span>
        <span className="hidden sm:inline">{selectedPersona?.name || 'Default'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-surface-elevated border border-border rounded-xl shadow-2xl z-20 overflow-hidden">
            <div className="p-3">
              <div className="text-xs font-semibold text-text-secondary mb-2">Active Persona</div>
              <div className="space-y-1">
                {personas.map(persona => (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-colors
                      ${settings.selectedPersona === persona.id
                        ? 'bg-accent text-white'
                        : 'hover:bg-surface text-text-primary'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{persona.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{persona.name}</div>
                        <div className={`text-xs mt-0.5 truncate ${settings.selectedPersona === persona.id ? 'text-white opacity-80' : 'text-text-secondary'}`}>
                          {persona.systemPrompt.substring(0, 40)}...
                        </div>
                      </div>
                      {settings.selectedPersona === persona.id && (
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PersonaSelector;
