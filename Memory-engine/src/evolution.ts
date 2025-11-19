import { computeAeiCode, MemoryLevel, Sensitivity } from './computeAeiCode';
import { VaultEntity } from './vaultAdapter';
import { embed } from './embedding';
import { InMemoryVectorIndex, VectorRecord } from './vectorIndex';

export interface EvolutionContext {
  index: InMemoryVectorIndex; // current index
  // thresholds could be loaded from config later
  promotionThreshold: number; // importance needed to promote memory
  demotionInactivityDays: number; // days of inactivity to demote
}

export interface MutableEntityState extends VaultEntity {
  stability_score?: number;
  importance_score?: number;
  last_active_at?: Date;
  user_pinned?: boolean;
}

// Decide memory_level evolution given scores + pinned state
export function evolveMemory(entity: MutableEntityState, ctx: EvolutionContext): boolean {
  let changed = false;
  if (entity.user_pinned && entity.memory_level !== 'canonical') {
    entity.memory_level = 'canonical';
    changed = true;
  } else if (entity.importance_score && entity.importance_score >= ctx.promotionThreshold) {
    if (entity.memory_level === 'transitory') { entity.memory_level = 'temporary'; changed = true; }
    else if (entity.memory_level === 'temporary') { entity.memory_level = 'short_term'; changed = true; }
    else if (entity.memory_level === 'short_term') { entity.memory_level = 'long_term'; changed = true; }
  }
  if (entity.last_active_at) {
    const days = (Date.now() - entity.last_active_at.getTime()) / (1000*60*60*24);
    if (days >= ctx.demotionInactivityDays && entity.memory_level === 'long_term') {
      entity.memory_level = 'archived';
      changed = true;
    }
  }
  if (changed) {
    entity.aei_code = computeAeiCode(entity.memory_level, entity.sensitivity);
    // re-embed unless AI:NONE
    if (!entity.aei_code.includes('AI:NONE')) {
      const vector = entity.aei_code.includes('AI:META') ? embed(entity.title) : embed(entity.content.slice(0,2000));
      ctx.index.upsert([{ id: entity.id, vector, aei_code: entity.aei_code, memory_level: entity.memory_level, security_level: entity.sensitivity.level, vault_path: entity.vault_path } as VectorRecord]);
    }
  }
  return changed;
}
