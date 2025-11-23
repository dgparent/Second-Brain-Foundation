/**
 * Test utilities and mock factories for lifecycle-engine tests
 */

import { Entity } from '@sbf/shared';

export function createMockEntity(partial: Partial<Entity>): Entity {
  const now = new Date().toISOString();
  
  return {
    uid: partial.uid || 'test-entity-001',
    type: partial.type || 'daily-note',
    title: partial.title || 'Test Entity',
    created: partial.created || now,
    updated: partial.updated || now,
    lifecycle: partial.lifecycle || {
      state: 'capture',
    },
    sensitivity: partial.sensitivity || {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    content: partial.content || '',
    ...partial,
  };
}

export function createMockDailyNote(uid: string, hoursOld: number = 0, content: string = 'Test content'): Entity {
  const created = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
  
  return createMockEntity({
    uid,
    type: 'daily-note',
    title: uid.replace('daily-', ''),
    content,
    created: created.toISOString(),
    updated: created.toISOString(),
  });
}

export function createMockExtractedEntity(title: string, type: string = 'person'): Entity {
  return createMockEntity({
    uid: `${type}-${title.toLowerCase().replace(/\s+/g, '-')}-001`,
    type,
    title,
    lifecycle: {
      state: 'permanent',
    },
  });
}
