import React from 'react';
import { Command } from 'cmdk';
import { Kbd } from '../../design-system/primitives';
import clsx from 'clsx';

const CommandItem = ({ command, onSelect }) => {
  const Icon = command.icon;

  return (
    <Command.Item
      value={command.label}
      onSelect={() => onSelect(command)}
      className={clsx(
        'flex items-center justify-between px-4 py-3 cursor-pointer rounded-lg',
        'text-neutral-900 dark:text-neutral-100',
        'data-[selected=true]:bg-accent-100 dark:data-[selected=true]:bg-accent-900/30',
        'data-[selected=true]:text-accent-900 dark:data-[selected=true]:text-accent-100',
        'transition-colors',
        command.variant === 'danger' && 'data-[selected=true]:bg-red-100 dark:data-[selected=true]:bg-red-900/30 data-[selected=true]:text-red-700 dark:data-[selected=true]:text-red-300'
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        {Icon && (
          <Icon
            className={clsx(
              'w-5 h-5',
              command.variant === 'danger' ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400'
            )}
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{command.label}</span>
          {command.meta && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {command.meta}
            </span>
          )}
        </div>
      </div>

      {command.shortcut && (
        <Kbd className="ml-auto text-xs">
          {command.shortcut}
        </Kbd>
      )}
    </Command.Item>
  );
};

export default CommandItem;
