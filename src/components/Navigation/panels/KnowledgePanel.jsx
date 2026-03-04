import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { HiBookOpen, HiDocumentText, HiCircleStack, HiMagnifyingGlass, HiXMark, HiStar } from 'react-icons/hi2';
import KnowledgeBaseStorage from '../../../services/storage/KnowledgeBaseStorage';

function KnowledgePanel({ isCollapsed, activeColor = 'yellow', onOpenItem, selectedKnowledge }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'today', 'pinned', 'all'
  const [knowledgeBases, setKnowledgeBases] = useState([]);

  // Load knowledge bases from storage
  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      loadKnowledgeBases();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadKnowledgeBases = () => {
    const kbs = KnowledgeBaseStorage.getAllKnowledgeBases();
    setKnowledgeBases(kbs);
  };

  // Filter knowledge bases
  const getFilteredKBs = () => {
    let filtered = knowledgeBases;

    // Apply tab filter
    if (activeTab === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(kb => kb.createdAt >= today);
    } else if (activeTab === 'pinned') {
      filtered = filtered.filter(kb => kb.pinned);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((kb) =>
        kb.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredKBs = getFilteredKBs();

  const togglePin = (kbId, e) => {
    e.stopPropagation();
    const kb = knowledgeBases.find(k => k.id === kbId);
    if (kb) {
      KnowledgeBaseStorage.updateKnowledgeBase(kbId, { pinned: !kb.pinned });
    }
  };

  if (isCollapsed) {
    return (
      <div className="p-2">
        {knowledgeBases.slice(0, 5).map((kb) => (
          <button
            key={kb.id}
            onClick={() => onOpenItem?.(kb)}
            className="w-10 h-10 rounded-lg mb-2 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg"
            title={kb.name}
          >
            <span className="text-lg">{kb.icon}</span>
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
          placeholder="Search knowledge bases..."
          className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm placeholder:text-neutral-400"
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
              ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400'
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
              ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400'
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
              ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          Pinned
        </button>
      </div>

      {/* Knowledge Bases List */}
      <div className="space-y-1.5">
        {filteredKBs.map((kb) => (
          <button
            key={kb.id}
            onClick={() => onOpenItem?.(kb)}
            className={cn(
              "w-full p-2.5 rounded-md transition-colors text-left group",
              selectedKnowledge?.id === kb.id
                ? "bg-yellow-50 dark:bg-yellow-950/30 border-l-2 border-yellow-500"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0 text-base">
                {kb.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                    {kb.name}
                  </h3>
                  <button
                    onClick={(e) => togglePin(kb.id, e)}
                    className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors flex-shrink-0 ml-1"
                    title={kb.pinned ? 'Unpin' : 'Pin'}
                  >
                    <HiStar className={cn(
                      'w-3 h-3 transition-all',
                      kb.pinned
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-neutral-400 opacity-0 group-hover:opacity-100'
                    )} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <div className="flex items-center gap-0.5">
                    <HiDocumentText className="w-3 h-3" />
                    <span>{kb.documents}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <HiCircleStack className="w-3 h-3" />
                    <span>{kb.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}

        {filteredKBs.length === 0 && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center">
              <HiBookOpen className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-0.5">
              {searchQuery ? 'No knowledge bases found' : 'No knowledge bases'}
            </p>
            <p className="text-xs text-neutral-500">
              {searchQuery ? 'Try a different search' : 'Upload documents for RAG'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KnowledgePanel;
