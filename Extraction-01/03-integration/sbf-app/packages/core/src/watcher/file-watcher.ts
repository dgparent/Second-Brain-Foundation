/**
 * File Watcher System
 * 
 * Monitors vault for file changes and triggers entity extraction.
 * Based on industry-standard patterns using chokidar.
 * 
 * Features:
 * - Watch for new/modified markdown files
 * - Debounce rapid changes
 * - Filter out system files
 * - Event queue for processing
 * - Graceful shutdown
 */

import chokidar, { FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
import * as path from 'path';

/**
 * File change event types
 */
export type FileEventType = 'add' | 'change' | 'unlink';

/**
 * File change event
 */
export interface FileChangeEvent {
  type: FileEventType;
  path: string;
  absolutePath: string;
  timestamp: number;
}

/**
 * Watcher configuration
 */
export interface WatcherConfig {
  vaultPath: string;
  ignored?: string[];
  debounceMs?: number;
  persistent?: boolean;
}

/**
 * File Watcher
 * 
 * Monitors vault directory for markdown file changes.
 * Emits events that can be consumed by entity extraction pipeline.
 */
export class FileWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private config: Required<WatcherConfig>;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isWatching: boolean = false;

  constructor(config: WatcherConfig) {
    super();

    // Set defaults
    this.config = {
      vaultPath: config.vaultPath,
      ignored: config.ignored || [
        '**/node_modules/**',
        '**/.git/**',
        '**/.obsidian/**',
        '**/.*', // Hidden files
        '**/*.tmp',
        '**/*.swp',
      ],
      debounceMs: config.debounceMs ?? 1000, // 1 second default
      persistent: config.persistent ?? true,
    };
  }

  /**
   * Start watching the vault
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      console.warn('File watcher already running');
      return;
    }

    console.log(`Starting file watcher on: ${this.config.vaultPath}`);

    this.watcher = chokidar.watch(this.config.vaultPath, {
      ignored: this.config.ignored,
      persistent: this.config.persistent,
      ignoreInitial: true, // Don't emit events for existing files on startup
      awaitWriteFinish: {
        stabilityThreshold: 500, // Wait 500ms for file write to stabilize
        pollInterval: 100,
      },
      depth: 99, // Watch all subdirectories
    });

    // Register event handlers
    this.watcher
      .on('add', (filePath) => this.handleFileEvent('add', filePath))
      .on('change', (filePath) => this.handleFileEvent('change', filePath))
      .on('unlink', (filePath) => this.handleFileEvent('unlink', filePath))
      .on('error', (error) => this.handleError(error))
      .on('ready', () => this.handleReady());

    // Wait for watcher to be ready
    await new Promise<void>((resolve) => {
      this.watcher!.once('ready', resolve);
    });

    this.isWatching = true;
  }

  /**
   * Stop watching
   */
  async stop(): Promise<void> {
    if (!this.isWatching) {
      return;
    }

    console.log('Stopping file watcher...');

    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Close watcher
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    this.isWatching = false;
    console.log('File watcher stopped');
  }

  /**
   * Handle file event (with debouncing)
   */
  private handleFileEvent(type: FileEventType, filePath: string): void {
    // Only process markdown files
    if (!this.isMarkdownFile(filePath)) {
      return;
    }

    // Clear existing debounce timer for this file
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      this.emitFileEvent(type, filePath);
    }, this.config.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Emit file change event
   */
  private emitFileEvent(type: FileEventType, filePath: string): void {
    const absolutePath = path.resolve(this.config.vaultPath, filePath);
    const relativePath = path.relative(this.config.vaultPath, absolutePath);

    const event: FileChangeEvent = {
      type,
      path: relativePath,
      absolutePath,
      timestamp: Date.now(),
    };

    console.log(`File ${type}: ${relativePath}`);
    this.emit('change', event);
    this.emit(type, event); // Also emit specific event type
  }

  /**
   * Handle watcher errors
   */
  private handleError(error: Error): void {
    console.error('File watcher error:', error);
    this.emit('error', error);
  }

  /**
   * Handle watcher ready
   */
  private handleReady(): void {
    console.log('File watcher ready');
    this.emit('ready');
  }

  /**
   * Check if file is markdown
   */
  private isMarkdownFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.md' || ext === '.markdown';
  }

  /**
   * Get watching status
   */
  isActive(): boolean {
    return this.isWatching;
  }

  /**
   * Get watched path
   */
  getWatchedPath(): string {
    return this.config.vaultPath;
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<WatcherConfig> {
    return { ...this.config };
  }
}

/**
 * Create and start a file watcher
 */
export async function createFileWatcher(config: WatcherConfig): Promise<FileWatcher> {
  const watcher = new FileWatcher(config);
  await watcher.start();
  return watcher;
}
