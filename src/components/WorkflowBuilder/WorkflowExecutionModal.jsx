import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, Loader2, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * WorkflowExecutionModal - Modal for collecting inputs and running workflows
 * Similar to CrewAI's execution interface
 */
function WorkflowExecutionModal({ workflow, onClose, onExecute }) {
  const [inputs, setInputs] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState(null); // { status, currentNode, outputs, error }
  const [fileInputs, setFileInputs] = useState({});

  // Get input nodes from workflow
  const inputNodes = workflow?.nodes?.filter(n => n.type === 'input') || [];
  const hasInputs = inputNodes.length > 0;

  const handleFileChange = (inputName, event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileInputs(prev => ({ ...prev, [inputName]: file.name }));
        setInputs(prev => ({ ...prev, [inputName]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionStatus({ status: 'running', currentNode: null, outputs: {}, error: null });

    try {
      const result = await onExecute(inputs, (progress) => {
        // Update progress
        setExecutionStatus(prev => ({
          ...prev,
          currentNode: progress.currentNode,
          outputs: progress.outputs || {},
        }));
      });

      setExecutionStatus({
        status: 'completed',
        currentNode: null,
        outputs: result.outputs || {},
        error: null,
      });
    } catch (error) {
      setExecutionStatus({
        status: 'failed',
        currentNode: null,
        outputs: {},
        error: error.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const canRun = !hasInputs || inputNodes.every(node => inputs[node.data.name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Run Workflow
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
              {workflow.name}
            </p>
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
          {/* Inputs Section */}
          {hasInputs && !executionStatus && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Inputs
              </h3>
              {inputNodes.map((node) => (
                <div key={node.id}>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {node.data.label || node.data.name}
                    <span className="text-neutral-500 text-xs ml-1">
                      ({node.data.type || 'text'})
                    </span>
                  </label>

                  {node.data.type === 'file' ? (
                    <div>
                      <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors cursor-pointer">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(node.data.name, e)}
                          className="hidden"
                          accept="image/*,.pdf,.txt,.csv,.json"
                        />
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <Upload className="w-4 h-4" />
                          {fileInputs[node.data.name] || 'Click to upload file'}
                        </div>
                      </label>
                    </div>
                  ) : node.data.type === 'number' ? (
                    <input
                      type="number"
                      value={inputs[node.data.name] || ''}
                      onChange={(e) => setInputs({ ...inputs, [node.data.name]: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`Enter ${node.data.label || node.data.name}`}
                    />
                  ) : node.data.type === 'boolean' ? (
                    <select
                      value={inputs[node.data.name] || 'true'}
                      onChange={(e) => setInputs({ ...inputs, [node.data.name]: e.target.value === 'true' })}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <textarea
                      value={inputs[node.data.name] || ''}
                      onChange={(e) => setInputs({ ...inputs, [node.data.name]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      placeholder={`Enter ${node.data.label || node.data.name}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Execution Progress */}
          {executionStatus && executionStatus.status === 'running' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Executing Workflow...
                  </h3>
                  {executionStatus.currentNode && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Processing node: {executionStatus.currentNode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Execution Results */}
          {executionStatus && executionStatus.status === 'completed' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-semibold">Workflow Completed Successfully</h3>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Outputs
                </h4>
                {Object.entries(executionStatus.outputs).map(([key, value]) => (
                  <div key={key} className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      {key}
                    </div>
                    <div className="text-sm text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Error */}
          {executionStatus && executionStatus.status === 'failed' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <XCircle className="w-5 h-5" />
                <h3 className="text-sm font-semibold">Workflow Failed</h3>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {executionStatus.error}
                </p>
              </div>
            </div>
          )}

          {/* No Inputs Message */}
          {!hasInputs && !executionStatus && (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                This workflow has no input parameters.
                <br />
                Click Run to execute.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
          {!executionStatus && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                disabled={!canRun || isExecuting}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2',
                  canRun && !isExecuting
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg shadow-cyan-500/30'
                    : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                )}
              >
                <Play className="w-4 h-4" />
                Run Workflow
              </button>
            </>
          )}
          {executionStatus && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-lg transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkflowExecutionModal;
