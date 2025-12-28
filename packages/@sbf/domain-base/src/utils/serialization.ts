/**
 * @sbf/domain-base - Serialization Utilities
 * 
 * Utilities for serializing entities for database storage.
 */

import { ISO8601 } from '../types';
import { toISO8601 } from './timestamps';

/**
 * Fields that should be excluded from database serialization
 */
const EXCLUDED_FIELDS = new Set([
  '_db',
  '_embeddingProvider',
  '_dirty',
  '_original',
  '_isNew',
]);

/**
 * Convert a value to a database-safe format
 */
export function toDbValue(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }
  
  if (value instanceof Date) {
    return toISO8601(value);
  }
  
  if (Array.isArray(value)) {
    // Store arrays as JSON
    return JSON.stringify(value);
  }
  
  if (typeof value === 'object' && value !== null) {
    // Store objects as JSON
    return JSON.stringify(value);
  }
  
  return value;
}

/**
 * Convert a database value back to its original type
 */
export function fromDbValue<T>(value: unknown, targetType?: string): T {
  if (value === null || value === undefined) {
    return value as T;
  }
  
  // Handle JSON strings
  if (typeof value === 'string') {
    // Try to parse as JSON for arrays and objects
    if ((value.startsWith('[') && value.endsWith(']')) ||
        (value.startsWith('{') && value.endsWith('}'))) {
      try {
        return JSON.parse(value) as T;
      } catch {
        // Not valid JSON, return as string
      }
    }
    
    // Handle dates if expected
    if (targetType === 'date' || targetType === 'ISO8601') {
      return new Date(value) as unknown as T;
    }
  }
  
  return value as T;
}

/**
 * Convert entity to a format suitable for database save
 * Excludes internal fields and converts complex types
 */
export function modelDumpForSave(entity: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(entity)) {
    // Skip excluded fields
    if (EXCLUDED_FIELDS.has(key)) {
      continue;
    }
    
    // Skip all underscore-prefixed internal fields
    if (key.startsWith('_')) {
      continue;
    }
    
    // Skip functions
    if (typeof value === 'function') {
      continue;
    }
    
    // Skip undefined values
    if (value === undefined) {
      continue;
    }
    
    // Convert to snake_case for database
    const dbKey = toSnakeCase(key);
    result[dbKey] = toDbValue(value);
  }
  
  return result;
}

/**
 * Convert snake_case database row to camelCase entity
 */
export function rowToEntity<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(row)) {
    const camelKey = toCamelCase(key);
    result[camelKey] = value;
  }
  
  return result as T;
}

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Deep clone an object (for tracking changes)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = deepClone((obj as Record<string, unknown>)[key]);
  }
  
  return result as T;
}

/**
 * Check if two values are deeply equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(key => 
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }
  
  return false;
}

/**
 * Get changed fields between two objects
 */
export function getChangedFields(
  original: Record<string, unknown>,
  current: Record<string, unknown>
): Set<string> {
  const changed = new Set<string>();
  
  // Check current fields
  for (const key of Object.keys(current)) {
    if (!deepEqual(original[key], current[key])) {
      changed.add(key);
    }
  }
  
  // Check removed fields
  for (const key of Object.keys(original)) {
    if (!(key in current)) {
      changed.add(key);
    }
  }
  
  return changed;
}
