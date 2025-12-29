/**
 * SyncEngine - Bi-directional Vault Synchronization
 * 
 * Core sync engine for Obsidian <-> SBF synchronization.
 * Per PRD Epic 4 Story 4.1: Obsidian Companion Plugin
 */

import { Vault, TFile, Notice, MetadataCache } from 'obsidian';
import { FolderScanner } from './FolderScanner';
import { FrontmatterParser, SBFFrontmatter } from './FrontmatterParser';
import { WikilinkResolver } from './WikilinkResolver';
import { ConflictResolver, SyncState } from './ConflictResolver';
import { SBFClient } from '../api/SBFClient';
import {
  SyncResult,
  SyncOptions,
  SyncPlan,
  SyncConflict,
  SyncError,
  VaultNote,
  RemoteEntity,
  SBFFolderStructure,
  SBFPluginSettings,
  TYPE_TO_FOLDER,
} from '../types';

export class SyncEngine {
  private scanner: FolderScanner;
  private parser: FrontmatterParser;
  private resolver: WikilinkResolver;
  private conflicts: ConflictResolver;
  private uidMap: Map<string, string>;
  private syncStateMap: Map<string, SyncState>;
  private isSyncing: boolean = false;

  constructor(
    private vault: Vault,
    private cache: MetadataCache,
    private client: SBFClient,
    private settings: SBFPluginSettings
  ) {
    this.uidMap = new Map();
    this.syncStateMap = new Map();
    this.scanner = new FolderScanner(vault, settings);
    this.parser = new FrontmatterParser();
    this.resolver = new WikilinkResolver(vault, cache, this.uidMap);
    this.conflicts = new ConflictResolver();
  }

  /**
   * Run sync operation
   */
  async sync(options: SyncOptions): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.isSyncing = true;
    const startedAt = new Date();

    const result: SyncResult = {
      uploaded: 0,
      downloaded: 0,
      conflicts: [],
      errors: [],
      startedAt,
      completedAt: new Date(),
    };

    try {
      if (this.settings.showNotifications) {
        new Notice('Starting SBF sync...');
      }

      // 1. Scan local vault
      const localStructure = await this.scanner.scan();

      // 2. Fetch remote state
      const remoteEntities = await this.client.listEntities({
        since: this.getLastSyncTime(),
      });

      // 3. Build UID map from local files
      await this.buildUidMap(localStructure);

      // 4. Build sync plan
      const plan = await this.buildSyncPlan(
        localStructure,
        remoteEntities.entities,
        options
      );

      if (options.dryRun) {
        const msg = `Dry run: ${plan.toUpload.length} up, ${plan.toDownload.length} down, ${plan.conflicts.length} conflicts`;
        new Notice(msg);
        result.conflicts = plan.conflicts;
        return result;
      }

      // 5. Handle conflicts
      if (plan.conflicts.length > 0) {
        if (options.conflictResolution === 'ask') {
          result.conflicts = plan.conflicts;
          // Return early - UI will handle conflicts
          return result;
        }

        // Auto-resolve conflicts
        for (const conflict of plan.conflicts) {
          await this.resolveConflict(conflict, options, plan);
        }
      }

      // 6. Execute uploads (local → remote)
      if (options.direction === 'up' || options.direction === 'bidirectional') {
        for (const note of plan.toUpload) {
          try {
            await this.uploadFile(note);
            result.uploaded++;
          } catch (e) {
            const error = e as Error;
            result.errors.push({
              path: note.path,
              message: error.message,
              recoverable: true,
            });
          }
        }
      }

      // 7. Execute downloads (remote → local)
      if (options.direction === 'down' || options.direction === 'bidirectional') {
        for (const entity of plan.toDownload) {
          try {
            await this.downloadEntity(entity);
            result.downloaded++;
          } catch (e) {
            const error = e as Error;
            result.errors.push({
              path: entity.uid,
              message: error.message,
              recoverable: true,
            });
          }
        }
      }

      // 8. Update last sync time
      this.setLastSyncTime(new Date());

      if (this.settings.showNotifications) {
        new Notice(`Sync complete: ${result.uploaded}↑ ${result.downloaded}↓`);
      }
    } catch (e) {
      const error = e as Error;
      result.errors.push({
        path: '',
        message: `Sync failed: ${error.message}`,
        recoverable: false,
      });
      
      if (this.settings.showNotifications) {
        new Notice('Sync failed - check console for details');
      }
      
      console.error('SBF Sync Error:', error);
    } finally {
      this.isSyncing = false;
      result.completedAt = new Date();
    }

    return result;
  }

  /**
   * Build sync plan by comparing local and remote state
   */
  private async buildSyncPlan(
    local: SBFFolderStructure,
    remote: RemoteEntity[],
    options: SyncOptions
  ): Promise<SyncPlan> {
    const plan: SyncPlan = {
      toUpload: [],
      toDownload: [],
      conflicts: [],
      unchanged: 0,
    };

    // Build maps for efficient lookup
    const remoteByUid = new Map<string, RemoteEntity>();
    for (const entity of remote) {
      remoteByUid.set(entity.uid, entity);
    }

    // Flatten local notes
    const localNotes: VaultNote[] = [];
    for (const notes of Object.values(local.folders)) {
      localNotes.push(...notes);
    }

    // Add unmapped files as notes
    for (const path of local.unmappedFiles) {
      try {
        const file = this.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
          const content = await this.vault.read(file);
          localNotes.push({
            path,
            name: file.basename,
            content,
            mtime: file.stat.mtime,
          });
        }
      } catch (e) {
        console.warn(`Failed to read unmapped file: ${path}`, e);
      }
    }

    // Process local files
    const processedUids = new Set<string>();

    for (const note of localNotes) {
      const { frontmatter } = this.parser.parse(note.content);
      const uid = frontmatter.uid || this.uidMap.get(note.path);

      if (!uid) {
        // New local file, needs upload
        plan.toUpload.push(note);
        continue;
      }

      processedUids.add(uid);
      const remoteEntity = remoteByUid.get(uid);

      if (!remoteEntity) {
        // Exists locally but not remotely
        const syncState = this.syncStateMap.get(note.path);
        
        if (syncState?.remoteExists) {
          // Was synced before, remote was deleted
          const conflict = this.conflicts.detectDeletionConflict(
            note,
            null,
            syncState
          );
          if (conflict) {
            plan.conflicts.push(conflict);
          }
        } else {
          // Never synced, upload
          plan.toUpload.push(note);
        }
        continue;
      }

      // Both exist - check for conflicts
      const conflict = this.conflicts.detectConflict(note, remoteEntity);
      
      if (conflict) {
        plan.conflicts.push(conflict);
      } else {
        // Check which is newer
        const lastSync = frontmatter.sbf?.lastSync
          ? new Date(frontmatter.sbf.lastSync).getTime()
          : 0;
        
        const localNewer = note.mtime > lastSync;
        const remoteNewer = new Date(remoteEntity.updated_at).getTime() > lastSync;

        if (localNewer && !remoteNewer) {
          plan.toUpload.push(note);
        } else if (remoteNewer && !localNewer) {
          plan.toDownload.push(remoteEntity);
        } else {
          plan.unchanged++;
        }
      }
    }

    // Check for new remote entities
    for (const entity of remote) {
      if (!processedUids.has(entity.uid)) {
        // New remote entity, needs download
        plan.toDownload.push(entity);
      }
    }

    return plan;
  }

  /**
   * Resolve a conflict based on options
   */
  private async resolveConflict(
    conflict: SyncConflict,
    options: SyncOptions,
    plan: SyncPlan
  ): Promise<void> {
    let resolved: SyncConflict;

    switch (options.conflictResolution) {
      case 'local':
        resolved = this.conflicts.resolveLocal(conflict);
        break;
      case 'remote':
        resolved = this.conflicts.resolveRemote(conflict);
        break;
      case 'newest':
        resolved = this.conflicts.autoResolveNewest(conflict);
        break;
      default:
        return; // 'ask' - don't auto-resolve
    }

    // Apply resolution
    if (resolved.resolution === 'local') {
      const file = this.vault.getAbstractFileByPath(conflict.localPath);
      if (file instanceof TFile) {
        const content = await this.vault.read(file);
        const note: VaultNote = {
          path: file.path,
          name: file.basename,
          content,
          mtime: file.stat.mtime,
        };
        plan.toUpload.push(note);
      }
    } else if (resolved.resolution === 'remote') {
      const entity = await this.client.getEntity(conflict.remoteUid);
      if (entity) {
        plan.toDownload.push(entity);
      }
    }
  }

  /**
   * Upload file to SBF
   */
  private async uploadFile(note: VaultNote): Promise<void> {
    const { frontmatter, body } = this.parser.parse(note.content);
    
    // Generate UID if missing
    let uid = frontmatter.uid;
    if (!uid) {
      const type = this.parser.inferTypeFromPath(note.path) || 'note';
      uid = this.parser.generateUid(type, note.name);
    }

    // Convert wikilinks to SBF links
    const sbfBody = this.settings.convertLinks
      ? this.resolver.convertToSBFLinks(body, note.path)
      : body;

    // Build relationships
    const relationships = this.resolver.buildRelationships(body, note.path);

    // Extract tags from content
    const contentTags = this.parser.extractTagsFromContent(body);
    const allTags = [...new Set([...(frontmatter.tags || []), ...contentTags])];

    // Upsert to SBF
    const entity = await this.client.upsertEntity({
      uid,
      type: frontmatter.type || this.parser.inferTypeFromPath(note.path) || 'note',
      title: frontmatter.title || note.name,
      content: sbfBody,
      sensitivity: frontmatter.sensitivity || this.settings.defaultSensitivity,
      lifecycle: frontmatter.lifecycle,
      bmom: frontmatter.bmom,
      relationships,
      tags: allTags,
      metadata: {
        obsidian_path: note.path,
        obsidian_mtime: note.mtime,
      },
    });

    // Update local file with UID and sync metadata
    const file = this.vault.getAbstractFileByPath(note.path);
    if (file instanceof TFile) {
      const updatedContent = this.parser.update(note.content, {
        uid,
        type: frontmatter.type || this.parser.inferTypeFromPath(note.path),
        sbf: {
          lastSync: new Date().toISOString(),
          remoteChecksum: entity.checksum,
          remoteVersion: entity.version,
          status: 'synced',
        },
      });
      await this.vault.modify(file, updatedContent);
    }

    // Update UID map
    this.uidMap.set(note.path, uid);

    // Update sync state
    this.syncStateMap.set(note.path, {
      uid,
      localPath: note.path,
      localExists: true,
      remoteExists: true,
      lastSync: Date.now(),
      localChecksum: this.parser.calculateChecksum(body),
      remoteChecksum: entity.checksum,
    });
  }

  /**
   * Download entity from SBF to vault
   */
  private async downloadEntity(entity: RemoteEntity): Promise<void> {
    // Determine local path
    const folder = TYPE_TO_FOLDER[entity.type] || 'Topics';
    const safeName = entity.title.replace(/[\\/:*?"<>|]/g, '-');
    const path = `${folder}/${safeName}.md`;

    // Convert SBF links to wikilinks
    const body = this.resolver.convertToWikilinks(entity.content);

    // Build frontmatter
    const frontmatter: SBFFrontmatter = {
      uid: entity.uid,
      type: entity.type,
      title: entity.title,
      created: entity.created_at,
      modified: entity.updated_at,
      sensitivity: entity.sensitivity,
      lifecycle: entity.lifecycle,
      bmom: entity.bmom,
      relationships: entity.relationships,
      confidence: entity.confidence,
      tags: entity.tags,
      sbf: {
        lastSync: new Date().toISOString(),
        remoteChecksum: entity.checksum,
        remoteVersion: entity.version,
        status: 'synced',
      },
    };

    // Serialize content
    const content = this.parser.serialize(frontmatter, body);

    // Write or update file
    const existing = this.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      await this.vault.modify(existing, content);
    } else {
      // Ensure folder exists
      await this.ensureFolderExists(folder);
      await this.vault.create(path, content);
    }

    // Update UID map
    this.uidMap.set(path, entity.uid);

    // Update sync state
    this.syncStateMap.set(path, {
      uid: entity.uid,
      localPath: path,
      localExists: true,
      remoteExists: true,
      lastSync: Date.now(),
      remoteChecksum: entity.checksum,
    });
  }

  /**
   * Build UID map from local files
   */
  private async buildUidMap(structure: SBFFolderStructure): Promise<void> {
    this.uidMap.clear();

    for (const notes of Object.values(structure.folders)) {
      for (const note of notes) {
        const { frontmatter } = this.parser.parse(note.content);
        if (frontmatter.uid) {
          this.uidMap.set(note.path, frontmatter.uid);
        }
      }
    }

    // Update resolver with new map
    this.resolver.setUidMap(this.uidMap);
  }

  /**
   * Ensure folder exists
   */
  private async ensureFolderExists(folderPath: string): Promise<void> {
    const parts = folderPath.split('/');
    let current = '';

    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      const exists = this.vault.getAbstractFileByPath(current);
      if (!exists) {
        await this.vault.createFolder(current);
      }
    }
  }

  /**
   * Get last sync time from settings/storage
   */
  private getLastSyncTime(): string | undefined {
    // TODO: Store in plugin data
    return undefined;
  }

  /**
   * Set last sync time
   */
  private setLastSyncTime(_time: Date): void {
    // TODO: Store in plugin data
  }

  /**
   * Check if sync is in progress
   */
  get syncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Get current UID map
   */
  getUidMap(): Map<string, string> {
    return new Map(this.uidMap);
  }

  /**
   * Get sync state for a path
   */
  getSyncState(path: string): SyncState | undefined {
    return this.syncStateMap.get(path);
  }
}
