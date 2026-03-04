import React, { useState, useEffect } from 'react';
import { HiSparkles, HiTrash, HiPencil, HiExclamationTriangle, HiPlay } from 'react-icons/hi2';
import { cn } from '../../lib/utils';
import AgentCreator from './AgentCreator';
import AgentChat from './AgentChat';

/**
 * AgentsView - Main content view for agents section
 * Shows detail panel for selected agent (list is in secondary sidebar)
 */
function AgentsView({ isMobile, isTablet, selectedAgent, onAgentChange, triggerNew, selectedSession, onSessionChange }) {
  const [agents, setAgents] = useState(() => {
    const stored = localStorage.getItem('aether_agents');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [showCreator, setShowCreator] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [usingAgent, setUsingAgent] = useState(false);

  // Watch for triggerNew changes to open creator for new agent
  useEffect(() => {
    if (triggerNew > 0) {
      setEditingAgent(null);
      setShowCreator(true);
    }
  }, [triggerNew]);

  // Watch for selectedSession changes to open the chat with that session
  useEffect(() => {
    if (selectedSession && selectedSession.agentId) {
      // Find the agent for this session
      const agent = agents.find(a => a.id === selectedSession.agentId);
      if (agent) {
        onAgentChange?.(agent);
        setUsingAgent(true);
      }
    }
  }, [selectedSession, agents, onAgentChange]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('aether_agents');
      if (stored) {
        try {
          const updatedAgents = JSON.parse(stored);
          setAgents(updatedAgents);

          // Update selectedAgent if it was modified
          if (selectedAgent) {
            const updated = updatedAgents.find(a => a.id === selectedAgent.id);
            if (updated) {
              onAgentChange?.(updated);
            }
          }
        } catch (e) {
          console.error('Failed to parse agents:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedAgent, onAgentChange]);

  const handleSaveAgent = (agent) => {
    if (editingAgent) {
      // Update existing agent
      const updatedAgent = { ...agent, id: editingAgent.id, createdAt: editingAgent.createdAt };
      const updated = agents.map(a => a.id === editingAgent.id ? updatedAgent : a);
      setAgents(updated);
      localStorage.setItem('aether_agents', JSON.stringify(updated));
      onAgentChange?.(updatedAgent); // Update selected agent
    } else {
      // Create new agent
      const newAgent = {
        ...agent,
        id: Date.now().toString(),
        createdAt: Date.now(),
        pinned: false,
      };
      const updated = [newAgent, ...agents];
      setAgents(updated);
      localStorage.setItem('aether_agents', JSON.stringify(updated));
      onAgentChange?.(newAgent); // Select new agent
    }

    setShowCreator(false);
    setEditingAgent(null);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteClick = (agentId) => {
    setDeleteConfirm(agentId);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    const updated = agents.filter(a => a.id !== deleteConfirm);
    setAgents(updated);
    localStorage.setItem('aether_agents', JSON.stringify(updated));
    if (selectedAgent?.id === deleteConfirm) {
      onAgentChange?.(null);
    }
    window.dispatchEvent(new Event('storage'));
    setDeleteConfirm(null);
  };

  const handleEdit = (agent, e) => {
    e?.stopPropagation();
    setEditingAgent(agent);
    setShowCreator(true);
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
          {selectedAgent && usingAgent ? (
            /* Agent Chat Interface */
            <AgentChat
              agent={selectedAgent}
              onBack={() => {
                setUsingAgent(false);
                onSessionChange?.(null);
              }}
              sessionId={selectedSession?.id}
              initialMessages={selectedSession?.messages}
            />
          ) : selectedAgent ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-3xl">
                    {selectedAgent.icon || '🤖'}
                  </div>

                  {/* Header Info */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      {selectedAgent.name}
                    </h1>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      {selectedAgent.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUsingAgent(true)}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                      >
                        <HiPlay className="w-4 h-4" />
                        Use Agent
                      </button>
                      <button
                        onClick={(e) => handleEdit(selectedAgent, e)}
                        className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                      >
                        <HiPencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(selectedAgent.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                      >
                        <HiTrash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Configuration */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Configuration
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Model
                      </div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {selectedAgent.model || 'claude-sonnet-4-5@20250929'}
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Color Theme
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-4 h-4 rounded',
                            `bg-${selectedAgent.color || 'blue'}-500`
                          )}
                        />
                        <div className="text-sm text-neutral-900 dark:text-neutral-100 capitalize">
                          {selectedAgent.color || 'blue'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedAgent.skills?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-sm rounded-lg border border-purple-200 dark:border-purple-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategies */}
                {selectedAgent.strategies?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                      Strategies
                    </h3>
                    <div className="space-y-2">
                      {selectedAgent.strategies.map((strategy, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-sm text-neutral-700 dark:text-neutral-300"
                        >
                          {strategy}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Prompt */}
                {selectedAgent.systemPrompt && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                      System Prompt
                    </h3>
                    <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <pre className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-mono">
                        {selectedAgent.systemPrompt}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                  <HiSparkles className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Select an agent
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Choose an agent from the list to view its details
                </p>
              </div>
            </div>
          )}
      </div>

      {/* Agent Creator Modal */}
      {showCreator && (
        <AgentCreator
          onClose={() => {
            setShowCreator(false);
            setEditingAgent(null);
          }}
          onSave={handleSaveAgent}
          initialAgent={editingAgent}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <HiExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    Delete Agent
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Are you sure you want to delete this agent? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AgentsView;
