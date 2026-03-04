import React, { useState } from 'react';
import { HiArrowLeft, HiPlay, HiCheckCircle, HiXCircle, HiArrowDownTray, HiDocument } from 'react-icons/hi2';
import { Loader2, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * WorkflowExecution - Inline execution view (replaces main content)
 * Similar to AgentChat pattern
 */
function WorkflowExecution({ workflow, onBack, onExecute }) {
  const [inputs, setInputs] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState(null);
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
        nodeStates: result.nodeStates || {},
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

  const handleDownloadOutput = (outputKey, content) => {
    try {
      // Determine if content is a zip file or text
      const isZip = outputKey.toLowerCase().includes('zip') ||
                    (typeof content === 'string' && content.startsWith('data:application/zip'));

      const blob = isZip
        ? dataURLtoBlob(content)
        : new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)],
                   { type: 'text/plain' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflow.name}-${outputKey}.${isZip ? 'zip' : 'txt'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download output:', error);
    }
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const getNodeName = (nodeId) => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return nodeId;

    // For agent nodes, get agent name from localStorage
    if (node.type === 'agent' && node.data?.agentId) {
      try {
        const stored = localStorage.getItem('aether_agents');
        if (stored) {
          const agents = JSON.parse(stored);
          const agent = agents.find(a => a.id === node.data.agentId);
          if (agent) return agent.name;
        }
      } catch (e) {
        console.error('Failed to get agent name:', e);
      }
    }

    return node.data?.label || node.data?.name || nodeId;
  };

  const canRun = !hasInputs || inputNodes.every(node => inputs[node.data.name]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-start gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Run Workflow
            </h2>
            <p className="text-base font-medium text-cyan-600 dark:text-cyan-400">
              {workflow.name}
            </p>
          </div>

          {!executionStatus && (
            <button
              onClick={handleExecute}
              disabled={!canRun || isExecuting}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2 shadow-lg',
                canRun && !isExecuting
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30'
                  : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed shadow-none'
              )}
            >
              <HiPlay className="w-4 h-4" />
              Run Workflow
            </button>
          )}
        </div>

        {/* Workflow Description */}
        {workflow.description && (
          <div className="ml-14 p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-start gap-2">
              <HiDocument className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-cyan-900 dark:text-cyan-100 font-medium mb-1">
                  Workflow Description
                </p>
                <p className="text-sm text-cyan-700 dark:text-cyan-300">
                  {workflow.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Inputs Section */}
        {hasInputs && !executionStatus && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-4">
                Workflow Inputs
              </h3>
              <div className="space-y-4">
                {inputNodes.map((node) => (
                  <div key={node.id} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      {node.data.label || node.data.name}
                      <span className="text-neutral-500 text-xs ml-2">
                        ({node.data.type || 'text'})
                      </span>
                    </label>

                    {node.data.type === 'file' ? (
                      <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer">
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
                    ) : node.data.type === 'number' ? (
                      <input
                        type="number"
                        value={inputs[node.data.name] || ''}
                        onChange={(e) => setInputs({ ...inputs, [node.data.name]: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={`Enter ${node.data.label || node.data.name}`}
                      />
                    ) : node.data.type === 'boolean' ? (
                      <select
                        value={inputs[node.data.name] || 'true'}
                        onChange={(e) => setInputs({ ...inputs, [node.data.name]: e.target.value === 'true' })}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <textarea
                        value={inputs[node.data.name] || ''}
                        onChange={(e) => setInputs({ ...inputs, [node.data.name]: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        placeholder={`Enter ${node.data.label || node.data.name}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Inputs Message */}
        {!hasInputs && !executionStatus && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 flex items-center justify-center border-2 border-green-200 dark:border-green-800">
              <HiPlay className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Ready to Execute
            </h3>
            <p className="text-base text-neutral-600 dark:text-neutral-400 mb-6">
              This workflow has no input parameters. Click "Run Workflow" to start execution.
            </p>

            {/* Workflow Info Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
              <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800 text-left">
                <div className="text-xs font-medium text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                  Nodes
                </div>
                <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                  {workflow.nodes?.length || 0}
                </div>
              </div>
              <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800 text-left">
                <div className="text-xs font-medium text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                  Connections
                </div>
                <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                  {workflow.edges?.length || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Execution Progress */}
        {executionStatus && executionStatus.status === 'running' && (
          <div className="max-w-2xl mx-auto">
            <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-4">
                <Loader2 className="w-6 h-6 text-green-600 dark:text-green-400 animate-spin flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    Executing Workflow...
                  </h3>
                  {executionStatus.currentNode && (
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      Processing: <span className="font-medium">{getNodeName(executionStatus.currentNode)}</span>
                    </p>
                  )}

                  {/* Progress indicators for completed nodes */}
                  <div className="mt-4 space-y-2">
                    {Object.entries(executionStatus.outputs).map(([nodeId, output]) => (
                      <div key={nodeId} className="flex items-center gap-2 text-sm">
                        <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {getNodeName(nodeId)} completed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Execution Results */}
        {executionStatus && executionStatus.status === 'completed' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <HiCheckCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Workflow Completed Successfully</h3>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Outputs
              </h4>
              {Object.entries(executionStatus.outputs).map(([nodeId, value]) => (
                <div key={nodeId} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {getNodeName(nodeId)}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Node ID: {nodeId}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadOutput(nodeId, value)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Download output"
                    >
                      <HiArrowDownTray className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 p-3 rounded border border-neutral-200 dark:border-neutral-700 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words">
                      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Error */}
        {executionStatus && executionStatus.status === 'failed' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <HiXCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Workflow Failed</h3>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                {executionStatus.error}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowExecution;
