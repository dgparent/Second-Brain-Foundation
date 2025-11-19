/**
 * EntityMetadata Component
 * 
 * Displays entity metadata in a structured format
 */

import React from 'react';
import { Entity } from './EntityBrowser';

interface EntityMetadataProps {
  entity: Entity;
}

export const EntityMetadata: React.FC<EntityMetadataProps> = ({ entity }) => {
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

  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const MetadataItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="mb-4">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-white">
        {value}
      </dd>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Metadata
      </h3>

      <dl>
        {/* Type */}
        <MetadataItem
          label="Type"
          value={
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeColor(entity.type)}`}>
              {entity.type}
            </span>
          }
        />

        {/* UID */}
        <MetadataItem
          label="UID"
          value={
            <code className="text-xs font-mono bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded break-all">
              {entity.uid}
            </code>
          }
        />

        {/* Lifecycle State */}
        {entity.lifecycle?.state && (
          <MetadataItem
            label="Status"
            value={
              <span className={`font-medium ${getStateColor(entity.lifecycle.state)}`}>
                {entity.lifecycle.state.charAt(0).toUpperCase() + entity.lifecycle.state.slice(1)}
              </span>
            }
          />
        )}

        {/* Tags */}
        {entity.tags && entity.tags.length > 0 && (
          <MetadataItem
            label="Tags"
            value={
              <div className="flex flex-wrap gap-1">
                {entity.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            }
          />
        )}

        {/* Created */}
        <MetadataItem
          label="Created"
          value={
            <div>
              <div>{formatDateTime(entity.created)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {getTimeAgo(entity.created)}
              </div>
            </div>
          }
        />

        {/* Updated */}
        <MetadataItem
          label="Last Updated"
          value={
            <div>
              <div>{formatDateTime(entity.updated)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {getTimeAgo(entity.updated)}
              </div>
            </div>
          }
        />

        {/* Relationship Count */}
        {entity.rel && entity.rel.length > 0 && (
          <MetadataItem
            label="Relationships"
            value={
              <span className="text-gray-700 dark:text-gray-300">
                {entity.rel.length} {entity.rel.length === 1 ? 'link' : 'links'}
              </span>
            }
          />
        )}
      </dl>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
}
