/**
 * Enhanced Empty State Component
 * 
 * Displays engaging empty states with clear calls-to-action
 */

import React from 'react';

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  examples?: string[];
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  examples,
  action,
  secondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      {/* Icon */}
      <div className="text-6xl mb-4 animate-pulse">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>
      
      {/* Examples */}
      {examples && examples.length > 0 && (
        <div className="mb-6 w-full max-w-md">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Try asking:
          </p>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div
                key={index}
                className="text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                "{example}"
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-3">
        {action && (
          action.href ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {action.label}
            </button>
          )
        )}
        
        {secondaryAction && (
          secondaryAction.href ? (
            <a
              href={secondaryAction.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {secondaryAction.label}
            </a>
          ) : (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {secondaryAction.label}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default EmptyState;
