/**
 * FolderScanner - Obsidian Vault Folder Analysis
 * 
 * Maps Obsidian vault folders to SBF folder hierarchy.
 * Per PRD FR1-FR5: Daily/, People/, Places/, Topics/, Projects/, Transitional/
 */

import { TFile, TFolder, Vault } from 'obsidian';
import {
  SBFFolderStructure,
  VaultNote,
  SBF_FOLDERS,
  SBFPluginSettings,
} from '../types';

export class FolderScanner {
  constructor(
    private vault: Vault,
    private settings: SBFPluginSettings
  ) {}

  /**
   * Scan vault for SBF-compatible folder structure
   */
  async scan(): Promise<SBFFolderStructure> {
    const structure: SBFFolderStructure = {
      hasStructure: false,
      folders: {},
      unmappedFiles: [],
    };

    // Check for SBF folders
    for (const folderName of SBF_FOLDERS) {
      const folder = this.vault.getAbstractFileByPath(folderName);
      if (folder instanceof TFolder) {
        structure.hasStructure = true;
        structure.folders[folderName] = await this.scanFolder(folder);
      }
    }

    // Find files not in SBF folders
    const allFiles = this.vault.getMarkdownFiles();
    for (const file of allFiles) {
      // Skip excluded folders and patterns
      if (this.isExcluded(file.path)) {
        continue;
      }

      const topFolder = file.path.split('/')[0];
      const isSBFFolder = SBF_FOLDERS.some(
        (f) => f.toLowerCase() === topFolder.toLowerCase()
      );

      if (!isSBFFolder) {
        structure.unmappedFiles.push(file.path);
      }
    }

    return structure;
  }

  /**
   * Recursively scan folder contents
   */
  private async scanFolder(folder: TFolder): Promise<VaultNote[]> {
    const notes: VaultNote[] = [];

    for (const child of folder.children) {
      // Skip excluded files
      if (this.isExcluded(child.path)) {
        continue;
      }

      if (child instanceof TFile && child.extension === 'md') {
        try {
          const content = await this.vault.read(child);
          notes.push({
            path: child.path,
            name: child.basename,
            content,
            mtime: child.stat.mtime,
          });
        } catch (error) {
          console.error(`Failed to read file: ${child.path}`, error);
        }
      } else if (child instanceof TFolder) {
        // Recurse into subfolders
        const subNotes = await this.scanFolder(child);
        notes.push(...subNotes);
      }
    }

    return notes;
  }

  /**
   * Check if a path should be excluded from sync
   */
  private isExcluded(path: string): boolean {
    // Check folder exclusions
    for (const folder of this.settings.excludeFolders) {
      if (path.startsWith(folder + '/') || path === folder) {
        return true;
      }
    }

    // Check pattern exclusions
    for (const pattern of this.settings.excludePatterns) {
      if (this.matchPattern(path, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple pattern matching (supports * wildcard)
   */
  private matchPattern(path: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(path) || regex.test(path.split('/').pop() || '');
  }

  /**
   * Create SBF folder structure in vault
   */
  async ensureStructure(): Promise<string[]> {
    const created: string[] = [];

    for (const folderName of SBF_FOLDERS) {
      const folder = this.vault.getAbstractFileByPath(folderName);
      if (!folder) {
        try {
          await this.vault.createFolder(folderName);
          created.push(folderName);
        } catch (error) {
          console.error(`Failed to create folder: ${folderName}`, error);
        }
      }
    }

    return created;
  }

  /**
   * Get all markdown files in vault (respecting exclusions)
   */
  getAllFiles(): TFile[] {
    return this.vault
      .getMarkdownFiles()
      .filter((file) => !this.isExcluded(file.path));
  }

  /**
   * Get files that have been modified since a given timestamp
   */
  getModifiedSince(timestamp: number): TFile[] {
    return this.getAllFiles().filter((file) => file.stat.mtime > timestamp);
  }

  /**
   * Get vault statistics
   */
  async getStats(): Promise<VaultStats> {
    const structure = await this.scan();
    const stats: VaultStats = {
      totalFiles: 0,
      byFolder: {},
      unmappedCount: structure.unmappedFiles.length,
      totalSize: 0,
    };

    for (const [folder, notes] of Object.entries(structure.folders)) {
      stats.byFolder[folder] = notes.length;
      stats.totalFiles += notes.length;
      for (const note of notes) {
        stats.totalSize += Buffer.byteLength(note.content, 'utf-8');
      }
    }

    stats.totalFiles += structure.unmappedFiles.length;

    return stats;
  }

  /**
   * Determine the SBF folder for a given entity type
   */
  getFolderForType(type: string): string {
    const typeToFolder: Record<string, string> = {
      note: 'Daily',
      person: 'People',
      place: 'Places',
      topic: 'Topics',
      project: 'Projects',
      transitional: 'Transitional',
    };

    return typeToFolder[type.toLowerCase()] || 'Topics';
  }

  /**
   * Infer entity type from file path
   */
  inferTypeFromPath(path: string): string {
    const folder = path.split('/')[0]?.toLowerCase();

    const folderToType: Record<string, string> = {
      daily: 'note',
      people: 'person',
      places: 'place',
      topics: 'topic',
      projects: 'project',
      transitional: 'transitional',
    };

    return folderToType[folder] || 'note';
  }
}

/**
 * Vault statistics
 */
export interface VaultStats {
  /** Total number of markdown files */
  totalFiles: number;
  /** Files by SBF folder */
  byFolder: Record<string, number>;
  /** Files not in SBF folders */
  unmappedCount: number;
  /** Total size in bytes */
  totalSize: number;
}
