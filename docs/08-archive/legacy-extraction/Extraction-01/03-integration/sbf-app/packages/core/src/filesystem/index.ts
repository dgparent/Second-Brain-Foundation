/**
 * Filesystem Module
 * Vault operations for markdown files with YAML frontmatter
 * 
 * Refactored into focused classes:
 * - VaultCore: Path validation, initialization
 * - VaultFiles: File CRUD operations
 * - Vault: High-level operations (list, folders, etc.)
 */

export * from './vault-core';
export * from './vault-files';
export * from './vault';
