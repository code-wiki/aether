import React, { useState } from 'react';
import { X, Plug, Download, CheckCircle, Settings, Globe, Database, FileText, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import ToolsStorage from '../../services/storage/ToolsStorage';

/**
 * MCPServerConfig - Browse, install, and configure MCP servers
 */
function MCPServerConfig({ onClose, onInstall, initialServer }) {
  const [view, setView] = useState(initialServer ? 'configure' : 'browse'); // browse | configure
  const [selectedServer, setSelectedServer] = useState(initialServer || null);
  const [config, setConfig] = useState(initialServer?.config || {});
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Available MCP Servers (marketplace)
  const availableServers = [
    {
      id: 'filesystem',
      name: 'Filesystem',
      description: 'Read and write files on your computer',
      icon: '📁',
      category: 'Local',
      author: 'Anthropic',
      downloads: 15420,
      status: 'not-installed',
      configFields: [
        { name: 'allowedPaths', label: 'Allowed Paths', type: 'array', default: [] },
        { name: 'readOnly', label: 'Read Only', type: 'boolean', default: false },
      ],
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Manage repositories, issues, and pull requests',
      icon: '🐙',
      category: 'Developer',
      author: 'Anthropic',
      downloads: 12890,
      status: 'not-installed',
      configFields: [
        { name: 'token', label: 'GitHub Token', type: 'password', required: true },
        { name: 'owner', label: 'Default Owner', type: 'text', default: '' },
      ],
    },
    {
      id: 'brave-search',
      name: 'Brave Search',
      description: 'Search the web using Brave Search API',
      icon: '🔍',
      category: 'Web',
      author: 'Community',
      downloads: 8320,
      status: 'not-installed',
      configFields: [
        { name: 'apiKey', label: 'Brave API Key', type: 'password', required: true },
        { name: 'safeSearch', label: 'Safe Search', type: 'boolean', default: true },
      ],
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      description: 'Query PostgreSQL databases',
      icon: '🐘',
      category: 'Database',
      author: 'Community',
      downloads: 5240,
      status: 'not-installed',
      configFields: [
        { name: 'host', label: 'Host', type: 'text', required: true },
        { name: 'port', label: 'Port', type: 'number', default: 5432 },
        { name: 'database', label: 'Database', type: 'text', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
      ],
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send messages and read channels',
      icon: '💬',
      category: 'Communication',
      author: 'Community',
      downloads: 4180,
      status: 'not-installed',
      configFields: [
        { name: 'token', label: 'Slack Bot Token', type: 'password', required: true },
        { name: 'defaultChannel', label: 'Default Channel', type: 'text', default: 'general' },
      ],
    },
    {
      id: 'sqlite',
      name: 'SQLite',
      description: 'Query local SQLite databases',
      icon: '🗄️',
      category: 'Database',
      author: 'Anthropic',
      downloads: 3650,
      status: 'not-installed',
      configFields: [
        { name: 'dbPath', label: 'Database Path', type: 'text', required: true },
        { name: 'readOnly', label: 'Read Only', type: 'boolean', default: true },
      ],
    },
  ];

  const categories = [...new Set(availableServers.map(s => s.category))];

  const handleConfigure = (server) => {
    setSelectedServer(server);
    setView('configure');

    // Initialize config with defaults
    const defaultConfig = {};
    server.configFields.forEach(field => {
      if (field.default !== undefined) {
        defaultConfig[field.name] = field.default;
      }
    });
    setConfig(defaultConfig);
  };

  const handleInstall = () => {
    // Validate config
    const validation = ToolsStorage.validateServerConfig(selectedServer, config);

    if (!validation.valid) {
      alert(`Configuration errors:\n${validation.errors.join('\n')}`);
      return;
    }

    const serverData = {
      ...selectedServer,
      config,
      status: 'active',
      installedAt: initialServer?.installedAt || Date.now(),
    };

    onInstall(serverData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Plug className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {view === 'browse' ? 'MCP Server Marketplace' : `Configure ${selectedServer?.name}`}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {view === 'browse' ? 'Extend AI capabilities with MCP servers' : 'Set up server configuration'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'browse' ? (
            <div>
              {/* Categories */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium whitespace-nowrap">
                  All Servers
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Server Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableServers.map(server => (
                  <div
                    key={server.id}
                    className="p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">{server.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {server.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-full">
                            {server.category}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {server.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span>{server.author}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {server.downloads.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConfigure(server)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                    >
                      Install & Configure
                    </button>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Plug className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-pink-900 dark:text-pink-100 mb-1">
                      What are MCP Servers?
                    </h4>
                    <p className="text-sm text-pink-800 dark:text-pink-200">
                      Model Context Protocol (MCP) servers extend AI capabilities by providing access to external tools, APIs, databases, and data sources. Install servers to give your agents new abilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              {/* Server Info */}
              <div className="flex items-start gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-4xl">{selectedServer.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    {selectedServer.name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedServer.description}
                  </p>
                </div>
              </div>

              {/* Configuration Form */}
              <div>
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                  Configuration
                </h3>
                <div className="space-y-4">
                  {selectedServer.configFields.map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'boolean' ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config[field.name] || false}
                            onChange={(e) => setConfig({ ...config, [field.name]: e.target.checked })}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700"
                          />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Enable {field.label.toLowerCase()}
                          </span>
                        </label>
                      ) : field.type === 'array' ? (
                        <textarea
                          value={(config[field.name] || []).join('\n')}
                          onChange={(e) => setConfig({
                            ...config,
                            [field.name]: e.target.value.split('\n').filter(Boolean)
                          })}
                          placeholder="One per line"
                          rows={3}
                          className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                      ) : field.type === 'password' ? (
                        <div className="relative">
                          <input
                            type={visiblePasswords[field.name] ? 'text' : 'password'}
                            value={config[field.name] || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              [field.name]: e.target.value
                            })}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setVisiblePasswords({
                              ...visiblePasswords,
                              [field.name]: !visiblePasswords[field.name]
                            })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                            title={visiblePasswords[field.name] ? 'Hide' : 'Show'}
                          >
                            {visiblePasswords[field.name] ? (
                              <EyeOff className="w-4 h-4 text-neutral-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-neutral-500" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={config[field.name] || ''}
                          onChange={(e) => setConfig({
                            ...config,
                            [field.name]: field.type === 'number' ? parseInt(e.target.value) : e.target.value
                          })}
                          placeholder={field.default?.toString()}
                          className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Info */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Permissions:</strong> This MCP server will have access to {selectedServer.category.toLowerCase()} resources based on your configuration. Review settings carefully.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
          {view === 'configure' ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setView('browse')}
                className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleInstall}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                Install Server
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MCPServerConfig;
