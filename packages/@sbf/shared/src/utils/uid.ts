/**
 * UID Generation and Validation Utilities
 */

import { EntityType } from '../types';
import { ENTITY_UID_PATTERN } from '../constants';

export function generateUID(type: EntityType, title: string, counter: number = 1): string {
  const slug = slugify(title);
  const paddedCounter = String(counter).padStart(3, '0');
  return `${type}-${slug}-${paddedCounter}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export function validateUID(uid: string): boolean {
  return ENTITY_UID_PATTERN.test(uid);
}

export function parseUID(uid: string): { type: string; slug: string; counter: number } | null {
  const match = uid.match(ENTITY_UID_PATTERN);
  if (!match) return null;
  
  return {
    type: match[1],
    slug: match[2],
    counter: parseInt(match[3], 10),
  };
}

export function incrementUID(uid: string): string {
  const parsed = parseUID(uid);
  if (!parsed) throw new Error(`Invalid UID: ${uid}`);
  
  return generateUID(parsed.type, parsed.slug, parsed.counter + 1);
}
