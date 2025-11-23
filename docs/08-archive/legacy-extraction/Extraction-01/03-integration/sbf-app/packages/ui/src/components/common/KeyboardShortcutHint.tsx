/**
 * KeyboardShortcutHint Component
 * 
 * Displays keyboard shortcut hints for buttons and actions
 */

import React from 'react';

export interface KeyboardShortcutHintProps {
  keys: string[];
  className?: string;
}

export const KeyboardShortcutHint: React.FC<KeyboardShortcutHintProps> = ({
  keys,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${className}`}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">+</span>}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 font-mono">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  );
};
