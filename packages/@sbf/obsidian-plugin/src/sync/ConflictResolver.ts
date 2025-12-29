/**
 * ConflictResolver - Sync Conflict Detection & Resolution
 * 
 * Handles conflicts between local and remote versions.
 */

import { SyncConflict, VaultNote, RemoteEntity } from '../types';
import { FrontmatterParser } from './FrontmatterParser';

export class ConflictResolver {
  private parser: FrontmatterParser;

  constructor() {
    this.parser = new FrontmatterParser();
  }

  /**
   * Detect conflict between local and remote versions
   */
  detectConflict(
    local: VaultNote,
    remote: RemoteEntity
  ): SyncConflict | null {
    const { frontmatter: localFm, body: localBody } = this.parser.parse(local.content);
    
    // Get timestamps
    const localMtime = local.mtime;
    const remoteMtime = new Date(remote.updated_at).getTime();
    
    // Check if local has been modified since last sync
    const lastSync = localFm.sbf?.lastSync 
      ? new Date(localFm.sbf.lastSync).getTime() 
      : 0;
    
    const localModified = localMtime > lastSync;
    const remoteModified = remoteMtime > lastSync;
    
    // No conflict if only one side modified
    if (!localModified || !remoteModified) {
      return null;
    }
    
    // Check if content actually differs
    const localChecksum = this.parser.calculateChecksum(localBody);
    const remoteChecksum = remote.checksum || this.parser.calculateChecksum(remote.content);
    
    if (localChecksum === remoteChecksum) {
      // Content is same, no real conflict
      return null;
    }
    
    return {
      localPath: local.path,
      localContent: local.content,
      localMtime,
      remoteUid: remote.uid,
      remoteContent: this.serializeRemote(remote),
      remoteMtime,
      type: 'content',
    };
  }

  /**
   * Detect deletion conflicts
   */
  detectDeletionConflict(
    local: VaultNote | null,
    remote: RemoteEntity | null,
    lastSyncState: SyncState | null
  ): SyncConflict | null {
    // Local exists, remote doesn't - was remote deleted?
    if (local && !remote && lastSyncState?.remoteExists) {
      return {
        localPath: local.path,
        localContent: local.content,
        localMtime: local.mtime,
        remoteUid: lastSyncState.uid,
        remoteContent: '',
        remoteMtime: 0,
        type: 'deleted-remote',
      };
    }
    
    // Remote exists, local doesn't - was local deleted?
    if (!local && remote && lastSyncState?.localExists) {
      return {
        localPath: lastSyncState.localPath,
        localContent: '',
        localMtime: 0,
        remoteUid: remote.uid,
        remoteContent: this.serializeRemote(remote),
        remoteMtime: new Date(remote.updated_at).getTime(),
        type: 'deleted-local',
      };
    }
    
    return null;
  }

  /**
   * Resolve conflict by keeping local version
   */
  resolveLocal(conflict: SyncConflict): SyncConflict {
    return {
      ...conflict,
      resolution: 'local',
    };
  }

  /**
   * Resolve conflict by keeping remote version
   */
  resolveRemote(conflict: SyncConflict): SyncConflict {
    return {
      ...conflict,
      resolution: 'remote',
    };
  }

  /**
   * Resolve conflict by merging both versions
   */
  resolveMerge(conflict: SyncConflict, mergedContent: string): SyncConflict {
    return {
      ...conflict,
      resolution: 'merge',
      localContent: mergedContent,
    };
  }

  /**
   * Auto-resolve based on timestamps (newest wins)
   */
  autoResolveNewest(conflict: SyncConflict): SyncConflict {
    const resolution = conflict.localMtime > conflict.remoteMtime 
      ? 'local' 
      : 'remote';
    
    return {
      ...conflict,
      resolution,
    };
  }

  /**
   * Generate a simple merge of two versions
   * Places both versions in the document with conflict markers
   */
  generateMerge(local: string, remote: string): string {
    const { frontmatter: localFm, body: localBody } = this.parser.parse(local);
    const { frontmatter: remoteFm, body: remoteBody } = this.parser.parse(remote);
    
    // Merge frontmatter (local wins for most fields)
    const mergedFm = {
      ...remoteFm,
      ...localFm,
      modified: new Date().toISOString(),
    };
    
    // Add conflict markers to body
    const mergedBody = `<<<<<<< LOCAL
${localBody}
=======
${remoteBody}
>>>>>>> REMOTE

<!-- Please resolve the conflict above by keeping one version and removing the markers -->`;
    
    return this.parser.serialize(mergedFm, mergedBody);
  }

  /**
   * Check if content contains unresolved conflict markers
   */
  hasConflictMarkers(content: string): boolean {
    return content.includes('<<<<<<< LOCAL') || 
           content.includes('>>>>>>> REMOTE');
  }

  /**
   * Calculate similarity between two strings (0-1)
   */
  calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;
    
    // Simple Jaccard similarity on words
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    
    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) {
        intersection++;
      }
    }
    
    const union = wordsA.size + wordsB.size - intersection;
    return intersection / union;
  }

  /**
   * Serialize remote entity to markdown format
   */
  private serializeRemote(remote: RemoteEntity): string {
    const frontmatter = {
      uid: remote.uid,
      type: remote.type,
      title: remote.title,
      created: remote.created_at,
      modified: remote.updated_at,
      sensitivity: remote.sensitivity,
      lifecycle: remote.lifecycle,
      bmom: remote.bmom,
      relationships: remote.relationships,
      confidence: remote.confidence,
      tags: remote.tags,
    };
    
    return this.parser.serialize(frontmatter, remote.content);
  }

  /**
   * Build conflict summary for display
   */
  getSummary(conflict: SyncConflict): ConflictSummary {
    const { body: localBody } = this.parser.parse(conflict.localContent);
    const { body: remoteBody } = this.parser.parse(conflict.remoteContent);
    
    return {
      path: conflict.localPath,
      uid: conflict.remoteUid,
      type: conflict.type,
      localPreview: this.truncate(localBody, 200),
      remotePreview: this.truncate(remoteBody, 200),
      localMtime: new Date(conflict.localMtime),
      remoteMtime: new Date(conflict.remoteMtime),
      similarity: this.calculateSimilarity(localBody, remoteBody),
      localWordCount: localBody.split(/\s+/).length,
      remoteWordCount: remoteBody.split(/\s+/).length,
    };
  }

  /**
   * Truncate string with ellipsis
   */
  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }
}

/**
 * Sync state for a file (used for deletion detection)
 */
export interface SyncState {
  uid: string;
  localPath: string;
  localExists: boolean;
  remoteExists: boolean;
  lastSync: number;
  localChecksum?: string;
  remoteChecksum?: string;
}

/**
 * Conflict summary for UI display
 */
export interface ConflictSummary {
  path: string;
  uid: string;
  type: 'content' | 'deleted-local' | 'deleted-remote';
  localPreview: string;
  remotePreview: string;
  localMtime: Date;
  remoteMtime: Date;
  similarity: number;
  localWordCount: number;
  remoteWordCount: number;
}
