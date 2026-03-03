import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { v4 as uuidv4 } from 'uuid';

function PersonaManager() {
  const { settings, updateSettings } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    icon: '🤖',
  });

  const personas = settings.personas || [];

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      systemPrompt: '',
      icon: '🤖',
    });
  };

  const handleEdit = (persona) => {
    setEditingId(persona.id);
    setFormData({
      name: persona.name,
      systemPrompt: persona.systemPrompt,
      icon: persona.icon,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.systemPrompt) {
      alert('Please fill in all fields');
      return;
    }

    let updatedPersonas;

    if (editingId) {
      // Update existing persona
      updatedPersonas = personas.map(p =>
        p.id === editingId
          ? { ...p, ...formData }
          : p
      );
    } else {
      // Add new persona
      const newPersona = {
        id: uuidv4(),
        ...formData,
      };
      updatedPersonas = [...personas, newPersona];
    }

    updateSettings({ personas: updatedPersonas });
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', systemPrompt: '', icon: '🤖' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', systemPrompt: '', icon: '🤖' });
  };

  const handleDelete = (personaId) => {
    if (personaId === 'default') {
      alert('Cannot delete the default persona');
      return;
    }

    if (confirm('Delete this persona?')) {
      const updatedPersonas = personas.filter(p => p.id !== personaId);
      updateSettings({ personas: updatedPersonas });
    }
  };

  const handleSelectPersona = (personaId) => {
    updateSettings({ selectedPersona: personaId });
  };

  const emojiOptions = ['🤖', '💡', '📚', '🎨', '💻', '🔬', '✍️', '🎯', '🚀', '⚡'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Custom Personas</h3>
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Add Persona
        </button>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Create custom AI personas with different system prompts for specific tasks.
      </p>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="mb-4 p-4 bg-surface rounded-lg border border-border">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Icon
              </label>
              <div className="flex gap-2">
                {emojiOptions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`
                      w-10 h-10 rounded-lg text-xl transition-colors
                      ${formData.icon === emoji
                        ? 'bg-accent text-white'
                        : 'bg-surface-elevated hover:bg-border'
                      }
                    `}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Code Expert, Creative Writer"
                className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary placeholder-text-secondary outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                System Prompt
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="You are a helpful assistant specialized in..."
                rows={4}
                className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary placeholder-text-secondary outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-surface-elevated hover:bg-border text-text-primary rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Persona
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persona List */}
      <div className="space-y-2">
        {personas.map(persona => (
          <div
            key={persona.id}
            className={`
              p-3 rounded-lg border transition-colors
              ${settings.selectedPersona === persona.id
                ? 'border-accent bg-accent bg-opacity-10'
                : 'border-border bg-surface hover:bg-surface-elevated'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-2xl">{persona.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{persona.name}</div>
                  <div className="text-sm text-text-secondary mt-1 line-clamp-2">
                    {persona.systemPrompt}
                  </div>
                </div>
              </div>

              <div className="flex gap-1 ml-2">
                {settings.selectedPersona !== persona.id && (
                  <button
                    onClick={() => handleSelectPersona(persona.id)}
                    className="px-3 py-1 bg-accent hover:bg-accent-hover text-white rounded text-xs font-medium transition-colors"
                  >
                    Select
                  </button>
                )}

                {persona.id !== 'default' && (
                  <>
                    <button
                      onClick={() => handleEdit(persona)}
                      className="p-1.5 hover:bg-surface-elevated rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(persona.id)}
                      className="p-1.5 hover:bg-danger hover:bg-opacity-20 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {settings.selectedPersona === persona.id && (
              <div className="mt-2 px-2 py-1 bg-accent bg-opacity-20 rounded text-xs text-accent font-medium">
                Currently Active
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PersonaManager;
