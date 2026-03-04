import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { HiMagnifyingGlass, HiXMark, HiSparkles, HiCog6Tooth, HiStar } from 'react-icons/hi2';

/**
 * AgentsPanel - Shows AI agents list
 */
function AgentsPanel({ isCollapsed, activeColor = 'purple', onOpenItem, selectedAgent }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'today', 'pinned', 'all'
  const [agents, setAgents] = useState(() => {
    // Load agents from localStorage
    const stored = localStorage.getItem('aether_agents');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    // Default agents
    return [
      {
        id: '1',
        name: 'Research Assistant',
        description: 'Searches web, analyzes data, creates summaries',
        model: 'claude-sonnet-4-5',
        skills: ['web-search', 'data-analysis'],
        color: 'purple',
        icon: '🔍',
        pinned: false,
        createdAt: Date.now() - 86400000, // Yesterday
      },
      {
        id: '2',
        name: 'Content Creator',
        description: 'Writes blog posts, creates images, formats content',
        model: 'claude-sonnet-4-5',
        skills: ['writing', 'image-generation'],
        color: 'purple',
        icon: '✍️',
        pinned: false,
        createdAt: Date.now() - 86400000,
      },
    ];
  });

  // Filter agents based on active tab
  const getFilteredAgents = () => {
    let filtered = agents;

    // Apply tab filter
    if (activeTab === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(agent => agent.createdAt >= today);
    } else if (activeTab === 'pinned') {
      filtered = filtered.filter(agent => agent.pinned);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredAgents = getFilteredAgents();

  // Save agents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aether_agents', JSON.stringify(agents));
  }, [agents]);

  // Listen for storage events (when new agents are created)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('aether_agents');
      if (stored) {
        try {
          setAgents(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse agents:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const togglePin = (agentId, e) => {
    e.stopPropagation(); // Prevent opening the agent
    setAgents(prev => prev.map(agent =>
      agent.id === agentId ? { ...agent, pinned: !agent.pinned } : agent
    ));
  };

  if (isCollapsed) {
    return (
      <div className="p-2">
        {agents.slice(0, 5).map((agent) => (
          <button
            key={agent.id}
            className="w-10 h-10 rounded-lg mb-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg"
            title={agent.name}
          >
            <span className="text-lg">{agent.icon}</span>
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
          placeholder="Search agents..."
          className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-purple-500 text-sm placeholder:text-neutral-400"
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
              ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
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
              ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
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
              ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          Pinned
        </button>
      </div>

      {/* Agents List */}
      <div className="space-y-1.5">
        {filteredAgents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onOpenItem?.(agent)}
            className={cn(
              "w-full p-2.5 rounded-md transition-colors group text-left",
              selectedAgent?.id === agent.id
                ? "bg-purple-50 dark:bg-purple-950/30 border-l-2 border-purple-500"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="flex items-start gap-2">
              {/* Icon */}
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-base">
                {agent.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                    {agent.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                    <button
                      onClick={(e) => togglePin(agent.id, e)}
                      className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                      title={agent.pinned ? 'Unpin' : 'Pin'}
                    >
                      <HiStar className={cn(
                        'w-3 h-3 transition-all',
                        agent.pinned
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-neutral-400 opacity-0 group-hover:opacity-100'
                      )} />
                    </button>
                    <HiCog6Tooth className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-1.5">
                  {agent.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {agent.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {agent.skills.length > 2 && (
                    <span className="px-1.5 py-0.5 text-neutral-500 text-xs">
                      +{agent.skills.length - 2}
                    </span>
                  )}
                </div>

                {/* Model */}
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  <HiSparkles className="w-3 h-3" />
                  <span>Sonnet 4.5</span>
                </div>
              </div>
            </div>
          </button>
        ))}

        {filteredAgents.length === 0 && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
              <HiSparkles className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-0.5">
              {searchQuery ? 'No agents found' : 'No agents yet'}
            </p>
            <p className="text-xs text-neutral-500">
              Create your first AI agent
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentsPanel;
