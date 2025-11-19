/**
 * Path Utilities
 * 
 * Secure path manipulation functions with directory traversal protection
 */

import * as path from 'path';

/**
 * Normalize path to prevent directory traversal attacks
 */
export function normalizePath(filepath: string): string {
  const normalized = path.normalize(filepath);
  return normalized.replace(/^(\.\.[\/\\])+/, '');
}

/**
 * Check if child path is within parent directory
 */
export function isWithin(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Join paths with security checks
 */
export function secureJoin(base: string, ...paths: string[]): string {
  const fullPath = path.join(base, ...paths.map(normalizePath));
  if (!isWithin(base, fullPath)) {
    throw new Error('Path traversal detected');
  }
  return fullPath;
}
