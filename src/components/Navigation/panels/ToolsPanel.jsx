import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { HiCubeTransparent, HiCube, HiMagnifyingGlass, HiXMark, HiStar } from 'react-icons/hi2';
import ToolsStorage from '../../../services/storage/ToolsStorage';

function ToolsPanel({ isCollapsed, activeColor = 'emerald', onOpenItem, selectedTool }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'today', 'pinned', 'all'
  const [tools, setTools] = useState([]);

  // Load tools from storage
  useEffect(() => {
    loadTools();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadTools();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadTools = () => {
    const allTools = ToolsStorage.getAllTools();
    setTools(allTools);
  };

  // Filter tools
  const getFilteredTools = () => {
    let filtered = tools;

    // Apply tab filter
    if (activeTab === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(tool => tool.createdAt >= today);
    } else if (activeTab === 'pinned') {
      filtered = filtered.filter(tool => tool.pinned);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTools = getFilteredTools();

  const togglePin = (toolId, e) => {
    e.stopPropagation();
    const tool = tools.find(t => t.id === toolId);
    if (tool && tool.type === 'MCP Server') {
      ToolsStorage.togglePin(toolId);
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-2">
        {tools.slice(0, 5).map((tool) => (
          <button
            key={tool.id}
            onClick={() => onOpenItem?.(tool)}
            className="w-10 h-10 rounded-lg mb-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg"
            title={tool.name}
          >
            <span className="text-lg">{tool.icon}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Search */}
      <div className="relative mb-3">
        <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools..."
          className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-neutral-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
          >
            <HiXMark className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-1">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            activeTab === 'all'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            activeTab === 'today'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab('pinned')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            activeTab === 'pinned'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          Pinned
        </button>
      </div>

      {/* Tools List */}
      <div className="space-y-1.5">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onOpenItem?.(tool)}
            className={cn(
              "w-full p-2.5 rounded-md transition-colors text-left group",
              selectedTool?.id === tool.id
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-emerald-500"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-base">
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h3 className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                      {tool.name}
                    </h3>
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        tool.status === 'active'
                          ? 'bg-emerald-500'
                          : 'bg-neutral-400'
                      }`}
                    />
                  </div>
                  {tool.type === 'MCP Server' && (
                    <button
                      onClick={(e) => togglePin(tool.id, e)}
                      className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors flex-shrink-0 ml-1"
                      title={tool.pinned ? 'Unpin' : 'Pin'}
                    >
                      <HiStar className={cn(
                        'w-3 h-3 transition-all',
                        tool.pinned
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-neutral-400 opacity-0 group-hover:opacity-100'
                      )} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-1">
                  {tool.description}
                </p>
                <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded">
                  {tool.type}
                </span>
              </div>
            </div>
          </button>
        ))}

        {filteredTools.length === 0 && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <HiCubeTransparent className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-0.5">
              {searchQuery ? 'No tools found' : 'No tools installed'}
            </p>
            <p className="text-xs text-neutral-500">
              {searchQuery ? 'Try a different search' : 'Add tools or MCP servers'}
            </p>
          </div>
        )}
      </div>

      {/* MCP Info */}
      <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-md">
        <div className="flex items-start gap-1.5">
          <HiCube className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-0.5">
              MCP Servers
            </h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
              Extend AI with external tools and APIs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToolsPanel;
