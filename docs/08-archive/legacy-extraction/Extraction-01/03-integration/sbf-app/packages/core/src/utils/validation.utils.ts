/**
 * Validation Utilities
 */

import { EntityType } from '../types';

/**
 * Check if UID matches expected pattern
 * Pattern: type-slug-counter (e.g., topic-machine-learning-042)
 */
export function isValidUID(uid: string): boolean {
  const pattern = /^[a-z-]+-[a-z0-9-]+-\d{3,}$/;
  return pattern.test(uid);
}

/**
 * Extract entity type from UID
 */
export function getTypeFromUID(uid: string): EntityType | null {
  if (!isValidUID(uid)) return null;
  const type = uid.split('-')[0];
  return type as EntityType;
}

/**
 * Check if string is empty or whitespace only
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}
