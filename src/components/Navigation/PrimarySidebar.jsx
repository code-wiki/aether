import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import AetherLogo from '../UI/AetherLogo';
import {
  HiChatBubbleLeftRight,
  HiSparkles,
  HiBeaker,
  HiBookOpen,
  HiCubeTransparent,
  HiCog6Tooth,
  HiMoon,
  HiSun
} from 'react-icons/hi2';

/**
 * PrimarySidebar - Main navigation (Sidebar 1)
 * Linear app-inspired design with proper macOS window chrome spacing
 * Always visible, icon-based, 64px wide
 */
function PrimarySidebar({ activeSection, onSectionChange, onSettingsClick }) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    {
      id: 'chat',
      label: 'Chat',
      icon: HiChatBubbleLeftRight,
      color: '#FF5DA2',
      lightBg: 'bg-pink-50',
      darkBg: 'dark:bg-pink-950/30',
      textColor: 'text-pink-600',
      darkTextColor: 'dark:text-pink-400',
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: HiSparkles,
      color: '#9D4EDD',
      lightBg: 'bg-purple-50',
      darkBg: 'dark:bg-purple-950/30',
      textColor: 'text-purple-600',
      darkTextColor: 'dark:text-purple-400',
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: HiBeaker,
      color: '#FF6B35',
      lightBg: 'bg-orange-50',
      darkBg: 'dark:bg-orange-950/30',
      textColor: 'text-orange-600',
      darkTextColor: 'dark:text-orange-400',
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      icon: HiBookOpen,
      color: '#FFB020',
      lightBg: 'bg-yellow-50',
      darkBg: 'dark:bg-yellow-950/30',
      textColor: 'text-yellow-600',
      darkTextColor: 'dark:text-yellow-400',
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: HiCubeTransparent,
      color: '#5B4DFF',
      lightBg: 'bg-blue-50',
      darkBg: 'dark:bg-blue-950/30',
      textColor: 'text-blue-600',
      darkTextColor: 'dark:text-blue-400',
    },
  ];

  return (
    <div className="w-14 h-full bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800/80 flex flex-col items-center">
      {/* macOS Window Chrome Spacing */}
      <div className="h-12" style={{ WebkitAppRegion: 'drag' }} />

      {/* Logo */}
      <div className="mb-6 group cursor-pointer">
        <div className="transition-all duration-300 group-hover:scale-105">
          <AetherLogo size={36} />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-1 w-full px-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'relative w-full h-11 rounded-md flex items-center justify-center transition-all duration-200 group',
                isActive
                  ? cn(item.lightBg, item.darkBg, item.textColor, item.darkTextColor)
                  : 'text-neutral-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900/50'
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />

              {/* Active Indicator */}
              {isActive && (
                <div
                  className="absolute left-0 w-0.5 h-5 rounded-r-full"
                  style={{ backgroundColor: item.color }}
                />
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150 shadow-lg z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-1 w-full px-1.5 pb-3">
        {/* Divider */}
        <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-2 mx-2" />

        <button
          onClick={toggleTheme}
          className="w-full h-11 rounded-md flex items-center justify-center text-neutral-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-all duration-200"
          title="Toggle theme"
        >
          {theme === 'light' ? (
            <HiMoon className="w-5 h-5" />
          ) : (
            <HiSun className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={onSettingsClick}
          className="w-full h-11 rounded-md flex items-center justify-center text-neutral-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-all duration-200"
          title="Settings"
        >
          <HiCog6Tooth className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default PrimarySidebar;
