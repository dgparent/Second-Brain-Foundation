/**
 * Common types shared across relationship-crm workflows
 */

import type { SimpleEntity } from '@sbf/frameworks-relationship-tracking';

// Re-export SimpleEntity for convenience
export type { SimpleEntity } from '@sbf/frameworks-relationship-tracking';

export interface SimpleMemoryEngine {
  query(filter: { type?: string; metadata?: any }): Promise<SimpleEntity[]>;
  store(entity: SimpleEntity): Promise<void>;
  update(uid: string, updates: Partial<SimpleEntity>): Promise<void>;
}

export interface SimpleAEIProvider {
  analyze(prompt: string, content: string): Promise<{ result: string; confidence: number }>;
}
