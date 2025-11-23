/**
 * File Event Processor
 * 
 * Processes file change events from FileWatcher.
 * Determines what action to take (extract entities, update, delete).
 */

import { FileChangeEvent, FileEventType } from './file-watcher';
import { Vault } from '../filesystem/vault';
import * as path from 'path';

/**
 * Processing action types
 */
export type ProcessingAction = 
  | 'extract_entities'    // New file or significant change
  | 'update_metadata'     // Minor change, update metadata only
  | 'delete_entity'       // File deleted
  | 'ignore';             // Ignore this change

/**
 * Processing result
 */
export interface ProcessingResult {
  event: FileChangeEvent;
  action: ProcessingAction;
  reason: string;
  entities?: string[]; // Entity UIDs affected
  timestamp: number;
}

/**
 * Processor configuration
 */
export interface ProcessorConfig {
  vault: Vault;
  dailyNotePattern?: RegExp;
  transitionPathlPattern?: RegExp;
}

/**
 * File Event Processor
 * 
 * Analyzes file changes and determines appropriate actions.
 */
export class FileEventProcessor {
  private vault: Vault;
  private dailyNotePattern: RegExp;
  private transitionPattern: RegExp;

  constructor(config: ProcessorConfig) {
    this.vault = config.vault;
    
    // Default patterns for daily notes and transitional folder
    this.dailyNotePattern = config.dailyNotePattern || 
      /^Daily\/\d{4}-\d{2}-\d{2}\.md$/;
    
    this.transitionPattern = config.transitionPathlPattern || 
      /^Transitional\//;
  }

  /**
   * Process a file change event
   */
  async process(event: FileChangeEvent): Promise<ProcessingResult> {
    const action = await this.determineAction(event);
    const reason = this.getActionReason(event, action);

    return {
      event,
      action,
      reason,
      timestamp: Date.now(),
    };
  }

  /**
   * Determine what action to take for this event
   */
  private async determineAction(event: FileChangeEvent): Promise<ProcessingAction> {
    const { type, path: filePath } = event;

    // Handle deletions
    if (type === 'unlink') {
      return this.shouldTrackDeletion(filePath) ? 'delete_entity' : 'ignore';
    }

    // Handle new files
    if (type === 'add') {
      return this.shouldExtractEntities(filePath) ? 'extract_entities' : 'ignore';
    }

    // Handle changes
    if (type === 'change') {
      // Check if this is a significant change
      const isSignificant = await this.isSignificantChange(event);
      
      if (isSignificant) {
        return 'extract_entities';
      } else {
        return 'update_metadata';
      }
    }

    return 'ignore';
  }

  /**
   * Check if deletion should be tracked
   */
  private shouldTrackDeletion(filePath: string): boolean {
    // Don't track deletions in daily notes or transitional
    if (this.dailyNotePattern.test(filePath)) {
      return false;
    }

    if (this.transitionPattern.test(filePath)) {
      return false;
    }

    // Track deletions of permanent entities
    return true;
  }

  /**
   * Check if we should extract entities from this file
   */
  private shouldExtractEntities(filePath: string): boolean {
    // Always extract from daily notes
    if (this.dailyNotePattern.test(filePath)) {
      return true;
    }

    // Always extract from transitional
    if (this.transitionPattern.test(filePath)) {
      return true;
    }

    // Extract from new entity files
    const entityTypes = ['Topics', 'Projects', 'People', 'Places'];
    const inEntityFolder = entityTypes.some(type => 
      filePath.startsWith(`${type}/`)
    );

    return inEntityFolder;
  }

  /**
   * Check if a change is significant enough to re-extract entities
   */
  private async isSignificantChange(event: FileChangeEvent): Promise<boolean> {
    try {
      // Read file content
      const fileContent = await this.vault.readFile(event.path);
      if (!fileContent) {
        return false;
      }

      // Check for frontmatter changes (always significant)
      const hasFrontmatterChanges = this.checkFrontmatterChanges(fileContent);
      if (hasFrontmatterChanges) {
        return true;
      }

      // Check content length change (>20% = significant)
      const contentLength = fileContent.content.length;
      // TODO: Compare with previous length (need to track)
      // For now, treat all changes as significant
      
      return true;
    } catch (error) {
      console.error('Error checking change significance:', error);
      return false;
    }
  }

  /**
   * Check if frontmatter has changed
   */
  private checkFrontmatterChanges(fileContent: any): boolean {
    // Simple check: if frontmatter exists and has entity-related fields
    if (!fileContent.frontmatter) {
      return false;
    }

    const fm = fileContent.frontmatter;
    
    // Check for entity-defining fields
    const hasEntityFields = 
      fm.uid || 
      fm.type || 
      fm.title || 
      fm.rel || 
      fm.tags;

    return !!hasEntityFields;
  }

  /**
   * Get human-readable reason for action
   */
  private getActionReason(event: FileChangeEvent, action: ProcessingAction): string {
    const { type, path: filePath } = event;

    switch (action) {
      case 'extract_entities':
        if (type === 'add') {
          return `New file added: ${filePath}`;
        }
        return `Significant change detected in: ${filePath}`;

      case 'update_metadata':
        return `Minor change in: ${filePath}`;

      case 'delete_entity':
        return `Entity file deleted: ${filePath}`;

      case 'ignore':
        return `Ignoring change in: ${filePath}`;

      default:
        return 'Unknown action';
    }
  }

  /**
   * Get file category
   */
  getFileCategory(filePath: string): 'daily' | 'transitional' | 'entity' | 'other' {
    if (this.dailyNotePattern.test(filePath)) {
      return 'daily';
    }

    if (this.transitionPattern.test(filePath)) {
      return 'transitional';
    }

    const entityTypes = ['Topics', 'Projects', 'People', 'Places'];
    const inEntityFolder = entityTypes.some(type => 
      filePath.startsWith(`${type}/`)
    );

    if (inEntityFolder) {
      return 'entity';
    }

    return 'other';
  }
}

/**
 * Create a file event processor
 */
export function createFileEventProcessor(config: ProcessorConfig): FileEventProcessor {
  return new FileEventProcessor(config);
}
