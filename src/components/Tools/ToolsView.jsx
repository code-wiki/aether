import React, { useState, useEffect } from 'react';
import { HiCube, HiTrash, HiPencil, HiCheckCircle, HiExclamationTriangle, HiPlay, HiPause } from 'react-icons/hi2';
import MCPServerConfig from './MCPServerConfig';
import ToolsStorage from '../../services/storage/ToolsStorage';

/**
 * ToolsView - Main content view for MCP tools section
 * Shows detail panel for selected tool (list is in secondary sidebar)
 */
function ToolsView({ isMobile, isTablet, selectedTool, onToolChange, triggerNew }) {
  const [showConfig, setShowConfig] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState(null);

  // Watch for triggerNew changes to open config for new tool
  useEffect(() => {
    if (triggerNew > 0) {
      setEditingServer(null);
      setShowConfig(true);
    }
  }, [triggerNew]);

  // Load stats when tool changes
  useEffect(() => {
    if (selectedTool && selectedTool.type === 'MCP Server') {
      const toolStats = ToolsStorage.getServerStats(selectedTool.id);
      setStats(toolStats);
    } else {
      setStats(null);
    }
  }, [selectedTool]);

  const handleEdit = (server, e) => {
    e?.stopPropagation();
    setEditingServer(server);
    setShowConfig(true);
  };

  const handleInstall = (server) => {
    const saved = ToolsStorage.saveMCPServer(server);
    onToolChange?.(saved);
    setShowConfig(false);
    setEditingServer(null);
  };

  const handleToggleStatus = () => {
    if (selectedTool && selectedTool.type === 'MCP Server') {
      const updated = ToolsStorage.toggleServerStatus(selectedTool.id);
      onToolChange?.(updated);
    }
  };

  const handleDeleteClick = (toolId) => {
    setDeleteConfirm(toolId);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    // Only delete MCP servers (built-in tools can't be deleted)
    const tool = ToolsStorage.getTool(deleteConfirm);
    if (tool && tool.type === 'MCP Server') {
      ToolsStorage.deleteMCPServer(deleteConfirm);

      // Clear selection if the deleted tool was selected
      if (selectedTool?.id === deleteConfirm) {
        onToolChange?.(null);
      }
    }

    setDeleteConfirm(null);
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
        {selectedTool ? (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-3xl">
                  {selectedTool.icon || <HiCube className="w-8 h-8 text-white" />}
                </div>

                {/* Header Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedTool.name}
                    </h1>
                    {selectedTool.status === 'active' && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md">
                        Active
                      </span>
                    )}
                    {selectedTool.status === 'inactive' && (
                      <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-md">
                        Inactive
                      </span>
                    )}
                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium rounded-md">
                      {selectedTool.type}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {selectedTool.description}
                  </p>

                  <div className="flex items-center gap-2">
                    {selectedTool.type === 'MCP Server' && (
                      <button
                        onClick={handleToggleStatus}
                        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium ${
                          selectedTool.status === 'active'
                            ? 'bg-neutral-500 text-white hover:bg-neutral-600'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {selectedTool.status === 'active' ? (
                          <>
                            <HiPause className="w-4 h-4" />
                            Disable
                          </>
                        ) : (
                          <>
                            <HiPlay className="w-4 h-4" />
                            Enable
                          </>
                        )}
                      </button>
                    )}
                    {selectedTool.type === 'MCP Server' && (
                      <button
                        onClick={(e) => handleEdit(selectedTool, e)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                      >
                        <HiPencil className="w-4 h-4" />
                        Configure
                      </button>
                    )}
                    {selectedTool.type === 'MCP Server' && (
                      <button
                        onClick={() => handleDeleteClick(selectedTool.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                      >
                        <HiTrash className="w-4 h-4" />
                        Uninstall
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Details
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Provider
                      </div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {selectedTool.provider}
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Category
                      </div>
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {selectedTool.category || 'Uncategorized'}
                      </div>
                    </div>

                    {selectedTool.installedAt && (
                      <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                          Installed
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {new Date(selectedTool.installedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics (for MCP Servers) */}
                {stats && selectedTool.type === 'MCP Server' && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                      Usage Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                          Total Calls
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {stats.calls}
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                          Errors
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {stats.errors}
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg col-span-2">
                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                          Avg Response Time
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {stats.avgResponseTime}ms
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <HiCube className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Select a tool
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Choose a tool from the list to view its details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MCP Server Config Modal */}
      {showConfig && (
        <MCPServerConfig
          onClose={() => {
            setShowConfig(false);
            setEditingServer(null);
          }}
          onInstall={handleInstall}
          initialServer={editingServer}
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
                    Uninstall Tool
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Are you sure you want to uninstall this tool? This action cannot be undone.
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
                Uninstall
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ToolsView;
