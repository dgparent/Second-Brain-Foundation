/**
 * Queue Panel Component
 * 
 * Displays the organization queue with approval controls
 */

import React from 'react';
import { EmptyState } from './common/EmptyState';
import { Tooltip } from './common/Tooltip';

export interface QueueItemData {
  id: string;
  fileName: string;
  action: string;
  reason: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  timestamp: number;
}

export interface QueuePanelProps {
  items: QueueItemData[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onApproveAll: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  items,
  onApprove,
  onReject,
  onApproveAll,
}) => {
  const pendingItems = items.filter(item => item.status === 'pending');

  const getStatusColor = (status: QueueItemData['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'extract_entities':
        return '🔍';
      case 'update_metadata':
        return '📝';
      case 'delete_entity':
        return '🗑️';
      default:
        return '📄';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" data-tour="queue-panel">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Organization Queue
          </h2>
          {pendingItems.length > 0 && (
            <Tooltip content="Approve all pending items" position="left">
              <button
                onClick={onApproveAll}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Approve All ({pendingItems.length})
              </button>
            </Tooltip>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {items.length} total, {pendingItems.length} pending approval
        </p>
      </div>

      {/* Queue Items */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-64">
            <EmptyState
              icon="✅"
              title="All caught up!"
              description="I'll suggest organization actions as you create and edit notes."
              action={{
                label: "Learn about the queue",
                href: "/docs/guides/queue"
              }}
            />
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getActionIcon(item.action)}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.fileName}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.reason}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                {item.status === 'pending' && (
                  <div className="flex gap-2">
                    <Tooltip content="Approve this action" position="left">
                      <button
                        onClick={() => onApprove(item.id)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        aria-label="Approve"
                      >
                        ✓
                      </button>
                    </Tooltip>
                    <Tooltip content="Reject this action" position="left">
                      <button
                        onClick={() => onReject(item.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        aria-label="Reject"
                      >
                        ✗
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
