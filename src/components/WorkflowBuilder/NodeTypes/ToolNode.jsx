import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Wrench } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * ToolNode - Node for tool execution
 */
const ToolNode = memo(({ data, selected }) => {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 bg-white dark:bg-neutral-900 shadow-lg min-w-[200px]',
        selected
          ? 'border-cyan-500 ring-2 ring-cyan-500/20'
          : 'border-cyan-200 dark:border-cyan-800'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded">
          <Wrench className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
          {data.label || 'Tool'}
        </span>
      </div>

      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="opacity-75">Tool:</span>
          <span className="font-medium">{data.tool || 'N/A'}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

ToolNode.displayName = 'ToolNode';

export default ToolNode;
