/**
 * EntityDetail Component
 * 
 * Displays full entity details with metadata, content, and relationships
 * Supports inline editing and deletion
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Entity } from './EntityBrowser';
import { EntityMetadata } from './EntityMetadata';
import { RelationshipList } from './RelationshipList';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import toast from 'react-hot-toast';

interface EntityDetailProps {
  uid: string;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export const EntityDetail: React.FC<EntityDetailProps> = ({ 
  uid, 
  onClose, 
  onDeleted,
  onUpdated 
}) => {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadEntity();
  }, [uid]);

  const loadEntity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getEntity(uid);
      
      if (response.success && response.entity) {
        setEntity(response.entity);
        setEditedContent(response.entity.content || '');
      } else {
        setError(response.error || 'Failed to load entity');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!entity) return;

    try {
      setIsSaving(true);
      const response = await apiClient.updateEntity(uid, {
        content: editedContent,
      });

      if (response.success) {
        toast.success('Entity updated successfully');
        setIsEditing(false);
        await loadEntity();
        onUpdated?.();
      } else {
        toast.error(response.error || 'Failed to update entity');
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entity) return;

    try {
      const response = await apiClient.deleteEntity(uid);

      if (response.success) {
        toast.success('Entity deleted successfully');
        onDeleted?.();
        onClose();
      } else {
        toast.error(response.error || 'Failed to delete entity');
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(entity?.content || '');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Loading entity...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            Error Loading Entity
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {error || 'Entity not found'}
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
            <button
              onClick={loadEntity}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {entity.title}
            </h2>
            {entity.aliases && entity.aliases.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Also known as: {entity.aliases.join(', ')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Content
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-y"
                      placeholder="Entity content..."
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    {entity.content ? (
                      <MarkdownRenderer content={entity.content} />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No content available
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Relationships */}
              {entity.rel && entity.rel.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Relationships
                  </h3>
                  <RelationshipList relationships={entity.rel} />
                </div>
              )}
            </div>

            {/* Sidebar - Metadata */}
            <div className="lg:col-span-1">
              <EntityMetadata entity={entity} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete Entity
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadEntity}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Entity?"
        message={`Are you sure you want to delete "${entity.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
