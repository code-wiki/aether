import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { ArrowUpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * OutputNode - Node for workflow outputs
 */
const OutputNode = memo(({ data, selected }) => {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 bg-white dark:bg-neutral-900 shadow-lg min-w-[200px]',
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20'
          : 'border-amber-200 dark:border-amber-800'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded">
          <ArrowUpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
          {data.label || 'Output'}
        </span>
      </div>

      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="opacity-75">Name:</span>
          <span className="font-medium">{data.name || 'result'}</span>
        </div>
      </div>
    </div>
  );
});

OutputNode.displayName = 'OutputNode';

export default OutputNode;
