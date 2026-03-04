import React, { useState, useEffect } from 'react';
import { HiClock, HiCheckCircle, HiXCircle, HiArrowPath } from 'react-icons/hi2';
import { cn } from '../../../lib/utils';

/**
 * ExecutionHistoryPanel - Shows workflow execution history
 * Third sidebar panel for workflows
 */
function ExecutionHistoryPanel({ selectedWorkflow, executions, onExecutionClick, isCollapsed }) {
  const [filteredExecutions, setFilteredExecutions] = useState([]);

  useEffect(() => {
    if (selectedWorkflow && executions) {
      // Filter executions for selected workflow
      const workflowExecutions = executions.filter(
        exec => exec.workflowId === selectedWorkflow.id
      );
      setFilteredExecutions(workflowExecutions);
    } else {
      setFilteredExecutions([]);
    }
  }, [selectedWorkflow, executions]);

  const formatDuration = (startedAt, completedAt) => {
    if (!completedAt) return 'Running...';
    const duration = completedAt - startedAt;
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <HiXCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'running':
        return <HiArrowPath className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-spin" />;
      default:
        return <HiClock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getExecutionDescription = (exec) => {
    if (!exec.inputs || Object.keys(exec.inputs).length === 0) {
      return 'No inputs';
    }

    // Get first input value for description
    const firstKey = Object.keys(exec.inputs)[0];
    const firstValue = exec.inputs[firstKey];

    // Truncate long values
    const maxLength = 40;
    let description = String(firstValue);
    if (description.length > maxLength) {
      description = description.substring(0, maxLength) + '...';
    }

    return `${firstKey}: ${description}`;
  };

  if (isCollapsed) {
    return (
      <div className="p-2">
        {filteredExecutions.slice(0, 5).map((exec) => (
          <button
            key={exec.id}
            onClick={() => onExecutionClick?.(exec)}
            className={cn(
              'w-10 h-10 rounded-lg mb-2 flex items-center justify-center transition-all',
              exec.status === 'completed'
                ? 'bg-green-100 dark:bg-green-950/30'
                : exec.status === 'failed'
                ? 'bg-red-100 dark:bg-red-950/30'
                : 'bg-orange-100 dark:bg-orange-950/30'
            )}
            title={`Execution ${formatTime(exec.startedAt)}`}
          >
            {getStatusIcon(exec.status)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Execution History
        </h3>
        {selectedWorkflow && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {selectedWorkflow.name}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!selectedWorkflow ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HiClock className="w-12 h-12 mx-auto mb-2 text-neutral-300 dark:text-neutral-700" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Select a workflow to view execution history
              </p>
            </div>
          </div>
        ) : filteredExecutions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HiClock className="w-12 h-12 mx-auto mb-2 text-neutral-300 dark:text-neutral-700" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                No executions yet
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExecutions.map((exec) => (
              <button
                key={exec.id}
                onClick={() => onExecutionClick?.(exec)}
                className="w-full text-left p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-start gap-2 mb-2">
                  {getStatusIcon(exec.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                      {exec.status}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatTime(exec.startedAt)}
                    </div>
                  </div>
                </div>

                {/* Input description to differentiate executions */}
                <div className="mb-2 p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-200 dark:border-orange-800">
                  <div className="text-xs text-orange-900 dark:text-orange-100 font-medium truncate">
                    {getExecutionDescription(exec)}
                  </div>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {formatDuration(exec.startedAt, exec.completedAt)}
                    </span>
                  </div>
                  {exec.outputs && Object.keys(exec.outputs).length > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Outputs:</span>
                      <span className="font-medium">
                        {Object.keys(exec.outputs).length}
                      </span>
                    </div>
                  )}
                  {exec.error && (
                    <div className="text-red-600 dark:text-red-400 text-xs mt-1 truncate">
                      Error: {exec.error}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExecutionHistoryPanel;
