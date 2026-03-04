import React from 'react';
import { Brain, Wrench, ArrowDownCircle, ArrowUpCircle, Sparkles } from 'lucide-react';

/**
 * NodePalette - Left sidebar with draggable node types
 */
function NodePalette({ onAddNode }) {
  const nodeTypes = [
    {
      type: 'input',
      label: 'Input',
      icon: ArrowDownCircle,
      description: 'Start with user input',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      type: 'agent',
      label: 'Agent',
      icon: Sparkles,
      description: 'Use a custom agent',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      type: 'ai',
      label: 'AI Model',
      icon: Brain,
      description: 'Call an AI model',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      type: 'tool',
      label: 'Tool',
      icon: Wrench,
      description: 'Execute a tool',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    },
    {
      type: 'output',
      label: 'Output',
      icon: ArrowUpCircle,
      description: 'Return result',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  return (
    <div className="w-64 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Nodes
      </h3>

      <div className="space-y-2">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <button
              key={nodeType.type}
              onClick={() => onAddNode(nodeType.type, nodeType.label)}
              className="w-full p-3 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors text-left group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 ${nodeType.bg} rounded`}>
                  <Icon className={`w-4 h-4 ${nodeType.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                    {nodeType.label}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {nodeType.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 How to use
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Click nodes to add them</li>
          <li>• Drag to connect nodes</li>
          <li>• Click a node to configure</li>
          <li>• Save and run your workflow</li>
        </ul>
      </div>
    </div>
  );
}

export default NodePalette;
