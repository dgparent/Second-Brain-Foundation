/**
 * VaultFiles - File CRUD operations
 * 
 * Provides:
 * - Read/write markdown files with frontmatter
 * - Delete files
 * - File existence checks
 * - SHA-256 checksums
 * - Atomic writes (temp + rename)
 * 
 * Extracted from original Vault.ts (Phase 2.1 refactoring)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import grayMatter from 'gray-matter';
import { VaultCore } from './vault-core';

export interface FileContent {
  frontmatter: Record<string, any>;
  content: string;
  checksum?: string;
}

export class VaultFiles extends VaultCore {
  /**
   * Read markdown file with frontmatter parsing
   */
  async readFile(filePath: string): Promise<FileContent | null> {
    const fullPath = this.getFullPath(filePath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return null;
    }

    // Read and parse
    const markdown = await fs.readFile(fullPath, 'utf8');
    const { data, content } = grayMatter(markdown);

    // Calculate checksum
    const checksum = this.calculateChecksum(markdown);

    return {
      frontmatter: data,
      content: content.trim(),
      checksum,
    };
  }

  /**
   * Write markdown file with frontmatter
   * Uses atomic write pattern (temp file + rename)
   */
  async writeFile(
    filePath: string,
    frontmatter: Record<string, any>,
    content: string
  ): Promise<void> {
    const fullPath = this.getFullPath(filePath);

    // Ensure parent directory exists
    const dirPath = path.dirname(fullPath);
    await fs.mkdir(dirPath, { recursive: true });

    // Stringify frontmatter + content
    const markdown = grayMatter.stringify(content, frontmatter);

    // Atomic write: write to temp file, then rename
    const tempPath = `${fullPath}.tmp`;
    await fs.writeFile(tempPath, markdown, 'utf8');
    await fs.rename(tempPath, fullPath);
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = this.getFullPath(filePath);
    await fs.unlink(fullPath);
  }

  /**
   * Check if file exists
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = this.getFullPath(filePath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get checksum of file
   */
  async getChecksum(filePath: string): Promise<string | null> {
    const fileContent = await this.readFile(filePath);
    return fileContent?.checksum || null;
  }

  /**
   * Calculate SHA-256 checksum of file content
   */
  protected calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
