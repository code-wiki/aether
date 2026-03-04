import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Brain } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * AINode - Node for AI model calls
 */
const AINode = memo(({ data, selected }) => {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 bg-white dark:bg-neutral-900 shadow-lg min-w-[200px]',
        selected
          ? 'border-purple-500 ring-2 ring-purple-500/20'
          : 'border-purple-200 dark:border-purple-800'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
          {data.label || 'AI Model'}
        </span>
      </div>

      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="opacity-75">Provider:</span>
          <span className="font-medium">{data.provider || 'gemini'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="opacity-75">Model:</span>
          <span className="font-medium truncate max-w-[100px]">
            {data.model || 'gemini-1.5-flash'}
          </span>
        </div>
        {data.prompt && (
          <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded text-xs">
            <p className="truncate">{data.prompt.substring(0, 40)}...</p>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

AINode.displayName = 'AINode';

export default AINode;
