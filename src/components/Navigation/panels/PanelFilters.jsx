import React from 'react';
import { HiMagnifyingGlass, HiXMark, HiStar } from 'react-icons/hi2';
import { cn } from '../../../lib/utils';

/**
 * PanelFilters - Reusable search and tab filters for all panels
 * Maintains consistent UX across Chat, Agents, Workflows, Knowledge, Tools
 */
function PanelFilters({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  searchPlaceholder = 'Search...',
  color = 'blue', // blue, purple, cyan, amber, green
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-blue-500',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 ring-purple-500',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 ring-cyan-500',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 ring-amber-500',
    green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 ring-emerald-500',
  };

  const activeClass = colorClasses[color];

  return (
    <>
      {/* Search */}
      <div className="relative mb-3">
        <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            'w-full pl-8 pr-8 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 text-sm placeholder:text-neutral-400',
            `focus:ring-${color}-500 focus:border-${color}-500`
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
          >
            <HiXMark className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-1">
        <button
          onClick={() => onTabChange('all')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            activeTab === 'all'
              ? activeClass
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          All
        </button>
        <button
          onClick={() => onTabChange('today')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            activeTab === 'today'
              ? activeClass
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          Today
        </button>
        <button
          onClick={() => onTabChange('pinned')}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1',
            activeTab === 'pinned'
              ? activeClass
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          )}
        >
          <HiStar className="w-3 h-3" />
          Pinned
        </button>
      </div>
    </>
  );
}

export default PanelFilters;
