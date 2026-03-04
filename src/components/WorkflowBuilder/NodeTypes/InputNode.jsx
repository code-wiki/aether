import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { ArrowDownCircle, FileText, Image } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * InputNode - Node for workflow inputs
 */
const InputNode = memo(({ data, selected }) => {
  const getIcon = () => {
    if (data.type === 'file') {
      return <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
    return <ArrowDownCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
  };

  const getTypeDisplay = () => {
    const typeMap = {
      text: 'Text',
      file: 'File/Image',
      number: 'Number',
      boolean: 'Boolean',
    };
    return typeMap[data.type] || data.type || 'text';
  };

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 bg-white dark:bg-neutral-900 shadow-lg min-w-[200px]',
        selected
          ? 'border-green-500 ring-2 ring-green-500/20'
          : 'border-green-200 dark:border-green-800'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
          {getIcon()}
        </div>
        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
          {data.label || 'Input'}
        </span>
      </div>

      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center justify-between">
          <span className="opacity-75">Name:</span>
          <span className="font-medium">{data.name || 'input'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="opacity-75">Type:</span>
          <span className="font-medium">{getTypeDisplay()}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

InputNode.displayName = 'InputNode';

export default InputNode;
