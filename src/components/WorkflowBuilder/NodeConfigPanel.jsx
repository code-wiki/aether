import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAgent } from '../../context/AgentContext';

/**
 * NodeConfigPanel - Right sidebar for configuring selected node
 */
function NodeConfigPanel({ node, onUpdate, onClose }) {
  const { settings } = useSettings();
  const { getTools } = useAgent();
  const [config, setConfig] = useState(node.data);
  const [availableAgents, setAvailableAgents] = useState([]);

  useEffect(() => {
    setConfig(node.data);
  }, [node]);

  // Load available agents from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('aether_agents');
    if (stored) {
      try {
        setAvailableAgents(JSON.parse(stored));
      } catch (e) {
        setAvailableAgents([]);
      }
    }
  }, []);

  const handleProviderChange = (provider) => {
    const defaultModels = {
      gemini: 'gemini-1.5-flash',
      claude: 'claude-sonnet-4-5@20250929',
      openai: 'gpt-4o',
    };
    setConfig({
      ...config,
      provider,
      model: defaultModels[provider] || '',
    });
  };

  const handleUpdate = () => {
    onUpdate(config);
  };

  const handleAgentChange = (agentId) => {
    const selectedAgent = availableAgents.find(a => a.id === agentId);
    if (selectedAgent) {
      setConfig({
        ...config,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        agentModel: selectedAgent.model || 'claude-sonnet-4-5@20250929',
      });
    } else {
      setConfig({
        ...config,
        agentId: null,
        agentName: '',
        agentModel: '',
      });
    }
  };

  const renderConfigForType = () => {
    switch (node.type) {
      case 'ai':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Label
              </label>
              <input
                type="text"
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="AI Model"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Provider
              </label>
              <select
                value={config.provider || 'gemini'}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Model
              </label>
              <select
                value={config.model || ''}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="">Select model...</option>
                {config.provider === 'gemini' && (
                  <>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </>
                )}
                {config.provider === 'claude' && (
                  <>
                    <option value="claude-sonnet-4-5@20250929">Claude Sonnet 4.5</option>
                    <option value="claude-opus-4@20250514">Claude Opus 4</option>
                    <option value="claude-haiku-4@20250514">Claude Haiku 4</option>
                  </>
                )}
                {config.provider === 'openai' && (
                  <>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Prompt Template
              </label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono text-sm"
                placeholder="Enter prompt with {{variables}}"
              />
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Use {'{{variable}}'} for dynamic values from previous nodes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Temperature
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature || 0.7}
                onChange={(e) =>
                  setConfig({ ...config, temperature: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span>Precise</span>
                <span>{config.temperature || 0.7}</span>
                <span>Creative</span>
              </div>
            </div>
          </>
        );

      case 'agent':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Label
              </label>
              <input
                type="text"
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Agent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Select Agent
              </label>
              <select
                value={config.agentId || ''}
                onChange={(e) => handleAgentChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="">Choose an agent...</option>
                {availableAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.icon} {agent.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                The agent's configuration and skills will be used
              </p>
            </div>

            {config.agentId && (
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                <div className="text-xs font-medium text-cyan-900 dark:text-cyan-100 mb-1">
                  Selected: {config.agentName}
                </div>
                <div className="text-xs text-cyan-700 dark:text-cyan-300">
                  Model: {config.agentModel}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Task Instruction (Optional)
              </label>
              <textarea
                value={config.instruction || ''}
                onChange={(e) => setConfig({ ...config, instruction: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                placeholder="Specific task for this agent in the workflow..."
              />
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                Use {'{{variable}}'} to reference outputs from previous nodes
              </p>
            </div>
          </>
        );

      case 'tool':
        const availableTools = getTools();
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Label
              </label>
              <input
                type="text"
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Tool"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Tool
              </label>
              <select
                value={config.tool || ''}
                onChange={(e) => setConfig({ ...config, tool: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="">Select tool...</option>
                {availableTools.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Parameters (JSON)
              </label>
              <textarea
                value={
                  typeof config.parameters === 'string'
                    ? config.parameters
                    : JSON.stringify(config.parameters || {}, null, 2)
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setConfig({ ...config, parameters: parsed });
                  } catch (err) {
                    setConfig({ ...config, parameters: e.target.value });
                  }
                }}
                rows={6}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono text-sm"
                placeholder='{"key": "value"}'
              />
            </div>
          </>
        );

      case 'input':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Label
              </label>
              <input
                type="text"
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Variable Name
              </label>
              <input
                type="text"
                value={config.name || ''}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Type
              </label>
              <select
                value={config.type || 'text'}
                onChange={(e) => setConfig({ ...config, type: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="text">Text</option>
                <option value="file">File / Image</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                {config.type === 'file'
                  ? 'Accepts file uploads (images, PDFs, etc.)'
                  : 'The data type this input will accept'}
              </p>
            </div>
          </>
        );

      case 'output':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Label
              </label>
              <input
                type="text"
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Output"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Variable Name
              </label>
              <input
                type="text"
                value={config.name || ''}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="result"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-neutral-50 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Configure Node
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">{renderConfigForType()}</div>

      <button
        onClick={handleUpdate}
        className="w-full mt-6 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
      >
        Update Node
      </button>
    </div>
  );
}

export default NodeConfigPanel;
