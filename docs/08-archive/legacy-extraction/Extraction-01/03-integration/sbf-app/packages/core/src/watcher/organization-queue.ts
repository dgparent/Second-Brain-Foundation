/**
 * Organization Queue
 * 
 * Manages pending file changes that need organization.
 * Provides approval workflow for automated changes.
 * 
 * Based on Letta's queue patterns and SBF requirements.
 */

import { EventEmitter } from 'events';
import { FileChangeEvent } from './file-watcher';
import { ProcessingResult, ProcessingAction } from './file-processor';

/**
 * Queue item status
 */
export type QueueItemStatus = 
  | 'pending'      // Waiting for processing
  | 'processing'   // Currently being processed
  | 'approved'     // User approved
  | 'rejected'     // User rejected
  | 'completed'    // Successfully processed
  | 'failed';      // Processing failed

/**
 * Queue item
 */
export interface QueueItem {
  id: string;
  event: FileChangeEvent;
  processingResult: ProcessingResult;
  status: QueueItemStatus;
  addedAt: number;
  processedAt?: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Queue configuration
 */
export interface QueueConfig {
  autoApprove?: boolean;         // Auto-approve all items
  autoApproveActions?: ProcessingAction[]; // Auto-approve specific actions
  maxSize?: number;               // Max queue size
  batchSize?: number;             // Batch processing size
}

/**
 * Queue statistics
 */
export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  approved: number;
  rejected: number;
  completed: number;
  failed: number;
}

/**
 * Organization Queue
 * 
 * Manages a queue of file changes that need organization.
 * Provides approval workflow and batch processing.
 */
export class OrganizationQueue extends EventEmitter {
  private queue: Map<string, QueueItem> = new Map();
  private config: Required<QueueConfig>;
  private nextId: number = 1;

  constructor(config: QueueConfig = {}) {
    super();

    this.config = {
      autoApprove: config.autoApprove ?? false,
      autoApproveActions: config.autoApproveActions ?? ['update_metadata'],
      maxSize: config.maxSize ?? 1000,
      batchSize: config.batchSize ?? 10,
    };
  }

  /**
   * Add item to queue
   */
  async add(
    event: FileChangeEvent,
    processingResult: ProcessingResult
  ): Promise<QueueItem> {
    // Check queue size
    if (this.queue.size >= this.config.maxSize) {
      throw new Error(`Queue is full (${this.config.maxSize} items)`);
    }

    // Create queue item
    const item: QueueItem = {
      id: `queue-${this.nextId++}`,
      event,
      processingResult,
      status: 'pending',
      addedAt: Date.now(),
    };

    // Check auto-approval
    if (this.shouldAutoApprove(processingResult.action)) {
      item.status = 'approved';
    }

    this.queue.set(item.id, item);
    this.emit('item-added', item);

    console.log(
      `Added to queue: ${item.id} (${processingResult.action}) - ${event.path}`
    );

    // Auto-process if approved
    if (item.status === 'approved') {
      setImmediate(() => this.emit('item-ready', item));
    }

    return item;
  }

  /**
   * Approve an item
   */
  approve(itemId: string): QueueItem | null {
    const item = this.queue.get(itemId);
    if (!item) {
      return null;
    }

    if (item.status !== 'pending') {
      throw new Error(`Cannot approve item with status: ${item.status}`);
    }

    item.status = 'approved';
    this.emit('item-approved', item);
    this.emit('item-ready', item);

    return item;
  }

  /**
   * Reject an item
   */
  reject(itemId: string, reason?: string): QueueItem | null {
    const item = this.queue.get(itemId);
    if (!item) {
      return null;
    }

    if (item.status !== 'pending') {
      throw new Error(`Cannot reject item with status: ${item.status}`);
    }

    item.status = 'rejected';
    if (reason) {
      item.error = reason;
    }
    this.emit('item-rejected', item);

    return item;
  }

  /**
   * Approve multiple items
   */
  approveMultiple(itemIds: string[]): QueueItem[] {
    return itemIds
      .map(id => this.approve(id))
      .filter((item): item is QueueItem => item !== null);
  }

  /**
   * Reject multiple items
   */
  rejectMultiple(itemIds: string[], reason?: string): QueueItem[] {
    return itemIds
      .map(id => this.reject(id, reason))
      .filter((item): item is QueueItem => item !== null);
  }

  /**
   * Mark item as processing
   */
  markProcessing(itemId: string): QueueItem | null {
    const item = this.queue.get(itemId);
    if (!item) {
      return null;
    }

    item.status = 'processing';
    this.emit('item-processing', item);

    return item;
  }

  /**
   * Mark item as completed
   */
  markCompleted(itemId: string): QueueItem | null {
    const item = this.queue.get(itemId);
    if (!item) {
      return null;
    }

    item.status = 'completed';
    item.processedAt = Date.now();
    this.emit('item-completed', item);

    return item;
  }

  /**
   * Mark item as failed
   */
  markFailed(itemId: string, error: string): QueueItem | null {
    const item = this.queue.get(itemId);
    if (!item) {
      return null;
    }

    item.status = 'failed';
    item.processedAt = Date.now();
    item.error = error;
    this.emit('item-failed', item);

    return item;
  }

  /**
   * Get item by ID
   */
  get(itemId: string): QueueItem | null {
    return this.queue.get(itemId) || null;
  }

  /**
   * Get items by status
   */
  getByStatus(status: QueueItemStatus): QueueItem[] {
    return Array.from(this.queue.values()).filter(item => item.status === status);
  }

  /**
   * Get pending items
   */
  getPending(): QueueItem[] {
    return this.getByStatus('pending');
  }

  /**
   * Get approved items ready for processing
   */
  getApproved(): QueueItem[] {
    return this.getByStatus('approved');
  }

  /**
   * Get next batch of approved items
   */
  getNextBatch(size?: number): QueueItem[] {
    const batchSize = size || this.config.batchSize;
    const approved = this.getApproved();
    return approved.slice(0, batchSize);
  }

  /**
   * Get all items
   */
  getAll(): QueueItem[] {
    return Array.from(this.queue.values());
  }

  /**
   * Remove item from queue
   */
  remove(itemId: string): boolean {
    const deleted = this.queue.delete(itemId);
    if (deleted) {
      this.emit('item-removed', itemId);
    }
    return deleted;
  }

  /**
   * Clear completed and failed items
   */
  clearProcessed(): number {
    const toRemove = Array.from(this.queue.values())
      .filter(item => item.status === 'completed' || item.status === 'failed')
      .map(item => item.id);

    toRemove.forEach(id => this.remove(id));
    
    console.log(`Cleared ${toRemove.length} processed items`);
    return toRemove.length;
  }

  /**
   * Clear all items
   */
  clear(): void {
    const count = this.queue.size;
    this.queue.clear();
    this.emit('queue-cleared');
    console.log(`Cleared ${count} items from queue`);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const items = Array.from(this.queue.values());
    
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      processing: items.filter(i => i.status === 'processing').length,
      approved: items.filter(i => i.status === 'approved').length,
      rejected: items.filter(i => i.status === 'rejected').length,
      completed: items.filter(i => i.status === 'completed').length,
      failed: items.filter(i => i.status === 'failed').length,
    };
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.size;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.size === 0;
  }

  /**
   * Check if item should be auto-approved
   */
  private shouldAutoApprove(action: ProcessingAction): boolean {
    if (this.config.autoApprove) {
      return true;
    }

    return this.config.autoApproveActions.includes(action);
  }

  /**
   * Get configuration
   */
  getConfig(): Required<QueueConfig> {
    return { ...this.config };
  }
}

/**
 * Create an organization queue
 */
export function createOrganizationQueue(config?: QueueConfig): OrganizationQueue {
  return new OrganizationQueue(config);
}
