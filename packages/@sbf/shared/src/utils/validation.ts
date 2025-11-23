/**
 * Validation Utilities
 */

import { Entity } from '../types';
import { MAX_ENTITY_TITLE_LENGTH, MAX_CONTENT_SIZE } from '../constants';

export function validateEntity(entity: Partial<Entity>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!entity.uid) {
    errors.push('UID is required');
  }
  
  if (!entity.type) {
    errors.push('Type is required');
  }
  
  if (!entity.title) {
    errors.push('Title is required');
  } else if (entity.title.length > MAX_ENTITY_TITLE_LENGTH) {
    errors.push(`Title exceeds maximum length of ${MAX_ENTITY_TITLE_LENGTH}`);
  }
  
  if (!entity.created) {
    errors.push('Created timestamp is required');
  } else if (!isValidISO8601(entity.created)) {
    errors.push('Created timestamp must be ISO8601 format');
  }
  
  if (!entity.updated) {
    errors.push('Updated timestamp is required');
  } else if (!isValidISO8601(entity.updated)) {
    errors.push('Updated timestamp must be ISO8601 format');
  }
  
  if (!entity.lifecycle) {
    errors.push('Lifecycle is required');
  } else if (!['capture', 'transitional', 'permanent', 'archived'].includes(entity.lifecycle.state)) {
    errors.push('Invalid lifecycle state');
  }
  
  if (!entity.sensitivity) {
    errors.push('Sensitivity is required');
  } else if (!['public', 'personal', 'confidential', 'secret'].includes(entity.sensitivity.level)) {
    errors.push('Invalid sensitivity level');
  }
  
  if (entity.content && entity.content.length > MAX_CONTENT_SIZE) {
    errors.push(`Content exceeds maximum size of ${MAX_CONTENT_SIZE} bytes`);
  }
  
  if (entity.importance !== undefined && (entity.importance < 1 || entity.importance > 5)) {
    errors.push('Importance must be between 1 and 5');
  }
  
  if (entity.provenance && (entity.provenance.confidence < 0 || entity.provenance.confidence > 1)) {
    errors.push('Provenance confidence must be between 0 and 1');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isValidISO8601(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date.toISOString() === dateString;
  } catch {
    return false;
  }
}
