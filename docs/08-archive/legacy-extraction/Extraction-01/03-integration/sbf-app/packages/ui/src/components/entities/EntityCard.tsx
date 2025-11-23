/**
 * EntityCard Component
 * 
 * Displays a single entity in a card format
 */

import React from 'react';
import { Entity } from './EntityBrowser';

interface EntityCardProps {
  entity: Entity;
  onClick: () => void;
  isSelected?: boolean;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onClick, isSelected = false }) => {
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      Topic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Project: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Person: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      Place: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      Event: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      Resource: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStateColor = (state: string): string => {
    const colors: Record<string, string> = {
      active: 'text-green-600 dark:text-green-400',
      archived: 'text-gray-500 dark:text-gray-500',
      planning: 'text-blue-600 dark:text-blue-400',
      completed: 'text-purple-600 dark:text-purple-400',
      paused: 'text-yellow-600 dark:text-yellow-400',
    };
    return colors[state] || 'text-gray-600 dark:text-gray-400';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string | undefined, maxLength: number = 150): string => {
    if (!content) return 'No content';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border cursor-pointer transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {entity.title}
          </h3>
          {entity.aliases && entity.aliases.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              Also: {entity.aliases.join(', ')}
            </p>
          )}
        </div>
        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(entity.type)}`}>
          {entity.type}
        </span>
      </div>

      {/* Content Preview */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
        {truncateContent(entity.content)}
      </p>

      {/* Tags */}
      {entity.tags && entity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {entity.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
            >
              #{tag}
            </span>
          ))}
          {entity.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
              +{entity.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {entity.lifecycle?.state && (
            <span className={`font-medium ${getStateColor(entity.lifecycle.state)}`}>
              {entity.lifecycle.state}
            </span>
          )}
          {entity.rel && entity.rel.length > 0 && (
            <span title={`${entity.rel.length} relationships`}>
              🔗 {entity.rel.length}
            </span>
          )}
        </div>
        <span title={`Updated ${entity.updated}`}>
          {formatDate(entity.updated)}
        </span>
      </div>

      {/* UID (for debugging) */}
      <div className="mt-2 text-xs text-gray-400 dark:text-gray-600 font-mono truncate" title={entity.uid}>
        {entity.uid}
      </div>
    </div>
  );
};
