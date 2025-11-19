/**
 * VaultCore - Base vault operations
 * 
 * Provides:
 * - Path normalization (security)
 * - Directory traversal protection
 * - Vault initialization
 * 
 * Extracted from original Vault.ts (Phase 2.1 refactoring)
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export class VaultCore {
  protected vaultPath: string;

  constructor(vaultPath: string) {
    this.vaultPath = path.resolve(vaultPath);
  }

  /**
   * Initialize vault (create directory if needed)
   */
  async initialize(): Promise<void> {
    try {
      await fs.access(this.vaultPath);
    } catch {
      await fs.mkdir(this.vaultPath, { recursive: true });
    }
  }

  /**
   * Get the vault root path
   */
  getVaultPath(): string {
    return this.vaultPath;
  }

  /**
   * Normalize path to prevent directory traversal attacks
   * Extracted from anything-llm pattern
   */
  protected normalizePath(filepath: string): string {
    const normalized = path.normalize(filepath);
    // Remove leading ../ or ..\
    return normalized.replace(/^(\.\.[\/\\])+/, '');
  }

  /**
   * Ensure child path is within parent directory
   * Security check extracted from anything-llm
   */
  protected isWithin(parent: string, child: string): boolean {
    const relative = path.relative(parent, child);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }

  /**
   * Get full path from relative path (with security checks)
   */
  protected getFullPath(filePath: string): string {
    const fullPath = path.join(this.vaultPath, this.normalizePath(filePath));

    // Security check
    if (!this.isWithin(this.vaultPath, fullPath)) {
      throw new Error('Path traversal detected');
    }

    return fullPath;
  }
}
