/**
 * Vault - High-level vault operations
 * 
 * Provides:
 * - Recursive file/folder listing
 * - Folder creation
 * - Frontmatter updates
 * 
 * Extracted from original Vault.ts (Phase 2.1 refactoring)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { VaultFiles } from './vault-files';

export interface VaultEntry {
  name: string;
  type: 'file' | 'folder';
  path: string;
  items?: VaultEntry[];
}

export class Vault extends VaultFiles {
  /**
   * List files and folders recursively
   * Pattern extracted from anything-llm/viewLocalFiles
   */
  async listFiles(folderPath: string = ''): Promise<VaultEntry> {
    const targetPath = folderPath
      ? path.join(this.vaultPath, this.normalizePath(folderPath))
      : this.vaultPath;

    const entry: VaultEntry = {
      name: path.basename(targetPath) || 'vault',
      type: 'folder',
      path: targetPath,
      items: [],
    };

    const files = await fs.readdir(targetPath);

    for (const file of files) {
      // Skip hidden files and .git
      if (file.startsWith('.')) continue;

      const fullPath = path.join(targetPath, file);
      const stats = await fs.lstat(fullPath);

      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        const subPath = folderPath ? `${folderPath}/${file}` : file;
        const subEntry = await this.listFiles(subPath);
        entry.items!.push(subEntry);
      } else if (file.endsWith('.md')) {
        // Only include markdown files
        entry.items!.push({
          name: file,
          type: 'file',
          path: fullPath,
        });
      }
    }

    return entry;
  }

  /**
   * Create folder
   */
  async createFolder(folderPath: string): Promise<void> {
    const fullPath = this.getFullPath(folderPath);
    await fs.mkdir(fullPath, { recursive: true });
  }

  /**
   * Update frontmatter of existing file
   */
  async updateFrontmatter(
    filePath: string,
    updates: Record<string, any>
  ): Promise<void> {
    const fileContent = await this.readFile(filePath);
    if (!fileContent) {
      throw new Error(`File not found: ${filePath}`);
    }

    const newFrontmatter = { ...fileContent.frontmatter, ...updates };
    await this.writeFile(filePath, newFrontmatter, fileContent.content);
  }
}

// Re-export types for convenience
export type { FileContent } from './vault-files';
