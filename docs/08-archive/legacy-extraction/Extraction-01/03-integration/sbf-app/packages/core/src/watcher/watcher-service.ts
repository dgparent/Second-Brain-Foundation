/**
 * Watcher Service
 * 
 * Main service that integrates:
 * - FileWatcher (monitors files)
 * - FileEventProcessor (analyzes changes)
 * - OrganizationQueue (manages approval workflow)
 * 
 * This is the high-level API for automated organization.
 */

import { FileWatcher, FileChangeEvent, createFileWatcher } from './file-watcher';
import { FileEventProcessor, createFileEventProcessor, ProcessingResult } from './file-processor';
import { OrganizationQueue, createOrganizationQueue, QueueItem, QueueConfig } from './organization-queue';
import { Vault } from '../filesystem/vault';
import { EventEmitter } from 'events';

/**
 * Watcher service configuration
 */
export interface WatcherServiceConfig {
  vaultPath: string;
  vault: Vault;
  queueConfig?: QueueConfig;
  debounceMs?: number;
  onProcessingNeeded?: (item: QueueItem) => Promise<void>;
}

/**
 * Watcher service events
 */
export interface WatcherServiceEvents {
  'started': () => void;
  'stopped': () => void;
  'file-detected': (event: FileChangeEvent) => void;
  'file-processed': (result: ProcessingResult) => void;
  'queue-item-added': (item: QueueItem) => void;
  'processing-needed': (item: QueueItem) => void;
  'error': (error: Error) => void;
}

/**
 * Watcher Service
 * 
 * Orchestrates file watching, event processing, and organization queue.
 */
export class WatcherService extends EventEmitter {
  private fileWatcher: FileWatcher | null = null;
  private processor: FileEventProcessor;
  private queue: OrganizationQueue;
  private config: WatcherServiceConfig;
  private isRunning: boolean = false;

  constructor(config: WatcherServiceConfig) {
    super();
    
    this.config = config;
    this.processor = createFileEventProcessor({ vault: config.vault });
    this.queue = createOrganizationQueue(config.queueConfig);

    // Wire up queue events
    this.queue.on('item-ready', (item: QueueItem) => {
      this.handleItemReady(item);
    });
  }

  /**
   * Start the watcher service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Watcher service already running');
      return;
    }

    console.log('Starting watcher service...');

    // Create and start file watcher
    this.fileWatcher = await createFileWatcher({
      vaultPath: this.config.vaultPath,
      debounceMs: this.config.debounceMs,
    });

    // Wire up file watcher events
    this.fileWatcher.on('change', (event: FileChangeEvent) => {
      this.handleFileChange(event);
    });

    this.fileWatcher.on('error', (error: Error) => {
      this.emit('error', error);
    });

    this.isRunning = true;
    this.emit('started');
    
    console.log('Watcher service started');
  }

  /**
   * Stop the watcher service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping watcher service...');

    if (this.fileWatcher) {
      await this.fileWatcher.stop();
      this.fileWatcher = null;
    }

    this.isRunning = false;
    this.emit('stopped');
    
    console.log('Watcher service stopped');
  }

  /**
   * Handle file change event
   */
  private async handleFileChange(event: FileChangeEvent): Promise<void> {
    try {
      this.emit('file-detected', event);

      // Process the event
      const result = await this.processor.process(event);
      this.emit('file-processed', result);

      // Ignore if action is 'ignore'
      if (result.action === 'ignore') {
        console.log(`Ignoring: ${event.path}`);
        return;
      }

      // Add to queue
      const queueItem = await this.queue.add(event, result);
      this.emit('queue-item-added', queueItem);

    } catch (error) {
      console.error('Error handling file change:', error);
      this.emit('error', error as Error);
    }
  }

  /**
   * Handle queue item ready for processing
   */
  private async handleItemReady(item: QueueItem): Promise<void> {
    try {
      // Mark as processing
      this.queue.markProcessing(item.id);

      // Notify external handler
      this.emit('processing-needed', item);

      // If external handler provided, call it
      if (this.config.onProcessingNeeded) {
        await this.config.onProcessingNeeded(item);
      }

    } catch (error) {
      console.error('Error processing queue item:', error);
      this.queue.markFailed(item.id, (error as Error).message);
      this.emit('error', error as Error);
    }
  }

  /**
   * Manually process a file
   */
  async processFile(filePath: string): Promise<ProcessingResult> {
    const event: FileChangeEvent = {
      type: 'change',
      path: filePath,
      absolutePath: filePath,
      timestamp: Date.now(),
    };

    return await this.processor.process(event);
  }

  /**
   * Get the organization queue
   */
  getQueue(): OrganizationQueue {
    return this.queue;
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    return this.queue.getStats();
  }

  /**
   * Approve a queue item
   */
  approveItem(itemId: string): QueueItem | null {
    return this.queue.approve(itemId);
  }

  /**
   * Reject a queue item
   */
  rejectItem(itemId: string, reason?: string): QueueItem | null {
    return this.queue.reject(itemId, reason);
  }

  /**
   * Approve multiple items
   */
  approveMultiple(itemIds: string[]): QueueItem[] {
    return this.queue.approveMultiple(itemIds);
  }

  /**
   * Get pending items needing approval
   */
  getPendingItems(): QueueItem[] {
    return this.queue.getPending();
  }

  /**
   * Clear processed items from queue
   */
  clearProcessed(): number {
    return this.queue.clearProcessed();
  }

  /**
   * Check if service is running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}

/**
 * Create a watcher service
 */
export function createWatcherService(config: WatcherServiceConfig): WatcherService {
  return new WatcherService(config);
}
