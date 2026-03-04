import React, { useState } from 'react';
import { X, Play, Upload, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import aiService from '../../services/ai/AIService';
import { useSettings } from '../../context/SettingsContext';

/**
 * AgentTestModal - Test individual agents with input/output
 */
function AgentTestModal({ agent, onClose }) {
  const { settings } = useSettings();
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFile({
          name: selectedFile.name,
          data: e.target.result,
          type: selectedFile.type,
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleTest = async () => {
    if (!input.trim() && !file) {
      return;
    }

    setIsTesting(true);
    setOutput(null);
    setError(null);

    try {
      // Initialize Claude provider (assuming agents use Claude)
      if (!aiService.activeProvider || aiService.activeProviderName !== 'claude') {
        await aiService.initializeProvider('claude', {
          projectId: settings.gcp.projectId,
          location: settings.gcp.location,
        });
      }

      // Prepare messages
      const messages = [
        {
          role: 'system',
          content: agent.systemPrompt || 'You are a helpful AI assistant.',
        },
        {
          role: 'user',
          content: input,
          ...(file && { attachments: [file] }),
        },
      ];

      // Execute agent
      const response = await aiService.sendMessage(
        messages,
        {
          model: agent.model || 'claude-sonnet-4-5@20250929',
          temperature: agent.temperature || 0.7,
        }
      );

      setOutput(response);
    } catch (err) {
      console.error('Agent test failed:', err);
      setError(err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl">
              {agent.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Test Agent
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {agent.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Agent Info */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Agent Configuration
            </h3>
            <div className="space-y-1 text-xs text-purple-700 dark:text-purple-300">
              <div>Model: {agent.model || 'claude-sonnet-4-5@20250929'}</div>
              <div>Temperature: {agent.temperature || 0.7}</div>
              {agent.skills && agent.skills.length > 0 && (
                <div>Skills: {agent.skills.join(', ')}</div>
              )}
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Input
            </h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Message
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Enter your test message for the agent..."
                disabled={isTesting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Attachment (Optional)
              </label>
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.txt,.csv,.json"
                  disabled={isTesting}
                />
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Upload className="w-4 h-4" />
                  {file ? file.name : 'Click to upload file (optional)'}
                </div>
              </label>
            </div>
          </div>

          {/* Output Section */}
          {(output || error || isTesting) && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Output
              </h3>

              {isTesting && (
                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Testing agent...
                  </span>
                </div>
              )}

              {output && !isTesting && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <pre className="text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap font-sans">
                    {output}
                  </pre>
                </div>
              )}

              {error && !isTesting && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleTest}
            disabled={(!input.trim() && !file) || isTesting}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2',
              input.trim() || file
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30'
                : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
            )}
          >
            <Play className="w-4 h-4" />
            {isTesting ? 'Testing...' : 'Test Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentTestModal;
