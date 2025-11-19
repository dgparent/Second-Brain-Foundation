/**
 * EntityBrowser Component
 * 
 * Main component for browsing and managing entities in the vault
 * 
 * Features:
 * - List all entities with filtering by type
 * - Search functionality
 * - Sort by date, title, type
 * - Click to view entity details
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { EntityCard } from './EntityCard';
import { EntityFilters } from './EntityFilters';
import { EntityDetail } from './EntityDetail';

export interface Entity {
  uid: string;
  type: string;
  title: string;
  aliases?: string[];
  created: string;
  updated: string;
  lifecycle?: {
    state: string;
  };
  tags?: string[];
  content?: string;
  rel?: Array<{ type: string; target: string }>;
}

export const EntityBrowser: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'created' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load entities on mount
  useEffect(() => {
    loadEntities();
  }, []);

  // Apply filters when entities or filter states change
  useEffect(() => {
    filterAndSortEntities();
  }, [entities, typeFilter, searchQuery, sortBy, sortOrder]);

  const loadEntities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getEntities();
      
      if (response.success && response.entities) {
        setEntities(response.entities);
      } else {
        setError(response.error || 'Failed to load entities');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEntities = () => {
    let filtered = [...entities];

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(e => e.type === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.content?.toLowerCase().includes(query) ||
        e.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'title') {
        compareValue = a.title.localeCompare(b.title);
      } else if (sortBy === 'created') {
        compareValue = new Date(a.created).getTime() - new Date(b.created).getTime();
      } else {
        compareValue = new Date(a.updated).getTime() - new Date(b.updated).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredEntities(filtered);
  };

  const handleEntityClick = (uid: string) => {
    setSelectedEntity(uid);
  };

  const handleCloseDetail = () => {
    setSelectedEntity(null);
  };

  const handleEntityDeleted = () => {
    setSelectedEntity(null);
    loadEntities();
  };

  const handleEntityUpdated = () => {
    loadEntities();
  };

  const handleRefresh = () => {
    loadEntities();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Loading entities...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full" data-tour="entity-browser">
        {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Entity Browser
          </h2>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Refresh entities"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <EntityFilters
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
      </div>

      {/* Entity Count */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredEntities.length} {filteredEntities.length === 1 ? 'entity' : 'entities'}
          {entities.length !== filteredEntities.length && (
            <span className="text-gray-500"> (filtered from {entities.length})</span>
          )}
        </p>
      </div>

      {/* Entity Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredEntities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No entities match your search' : 'No entities found'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntities.map(entity => (
              <EntityCard
                key={entity.uid}
                entity={entity}
                onClick={() => handleEntityClick(entity.uid)}
                isSelected={selectedEntity === entity.uid}
              />
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Entity Detail Modal */}
    {selectedEntity && (
      <EntityDetail
        uid={selectedEntity}
        onClose={handleCloseDetail}
        onDeleted={handleEntityDeleted}
        onUpdated={handleEntityUpdated}
      />
    )}
    </>
  );
};
