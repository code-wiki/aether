import React from 'react';
import { Handle, Position } from 'reactflow';
import { HiSparkles } from 'react-icons/hi2';
import { cn } from '../../../lib/utils';

/**
 * AgentNode - Workflow node for executing a custom agent
 * Similar to CrewAI, agents can be connected in workflows
 */
function AgentNode({ data, selected }) {
  return (
    <div
      className={cn(
        'min-w-[200px] rounded-lg border-2 bg-white dark:bg-neutral-900 shadow-lg transition-all',
        selected
          ? 'border-purple-500 shadow-purple-500/20'
          : 'border-neutral-200 dark:border-neutral-700'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500 border-2 border-white dark:border-neutral-900"
      />

      {/* Node Header */}
      <div className="px-3 py-2 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center gap-2">
        <HiSparkles className="w-4 h-4 text-white flex-shrink-0" />
        <span className="text-xs font-semibold text-white truncate">
          {data.label || 'Agent'}
        </span>
      </div>

      {/* Node Body */}
      <div className="p-3">
        {data.agentId ? (
          <div className="space-y-2">
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              <span className="font-medium">Agent:</span>{' '}
              <span className="text-neutral-900 dark:text-neutral-100">{data.agentName}</span>
            </div>
            {data.agentModel && (
              <div className="text-xs text-neutral-500 dark:text-neutral-500">
                Model: {data.agentModel}
              </div>
            )}
            {data.instruction && (
              <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                {data.instruction}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-neutral-500 dark:text-neutral-500 italic">
            No agent selected
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-purple-500 border-2 border-white dark:border-neutral-900"
      />
    </div>
  );
}

export default AgentNode;
